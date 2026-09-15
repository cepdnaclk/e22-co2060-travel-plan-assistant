const db = require("../config/db");
const { getCandidateRoutes } = require("./neighborService");
const { getHotelById } = require("./hotelService");
const { getRestaurantById } = require("./restaurantService");

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} mins`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
}

function formatDistance(distanceKm) {
  return `${Number(distanceKm).toFixed(1)} km`;
}

async function getAllItinerary(user_id) {
  if (user_id === undefined || user_id === null) {
    throw new Error("user_id is required");
  }

  const [sessions] = await db.execute(
    "SELECT session_id, travel_plan FROM user_travel_sessions WHERE user_id = ? ORDER BY created_at DESC",
    [user_id],
  );

  const result = [];

  for (const session of sessions) {
    // Parse travel_plan (support both legacy array [1,2,3] and structured object)
    let parsedPlan;
    try {
      parsedPlan =
        typeof session.travel_plan === "string"
          ? JSON.parse(session.travel_plan)
          : session.travel_plan;
    } catch (err) {
      console.error("Invalid JSON in travel_plan:", session.travel_plan);
      continue;
    }

    let ids = [];
    let startTime = "08:30";
    let endTime = "20:00";
    let rawMilestones = [];

    if (Array.isArray(parsedPlan)) {
      ids = parsedPlan;
    } else if (parsedPlan && typeof parsedPlan === "object") {
      ids = Array.isArray(parsedPlan.checkpoints) ? parsedPlan.checkpoints : [];
      startTime = parsedPlan.startTime || "08:30";
      endTime = parsedPlan.endTime || "20:00";
      rawMilestones = Array.isArray(parsedPlan.milestones) ? parsedPlan.milestones : [];
    }

    // Skip empty plans
    if (!Array.isArray(ids) || ids.length === 0) continue;

    const placeholders = ids.map(() => "?").join(",");

    const [destinations] = await db.execute(
      `SELECT d.destinationID, d.name, d.description, d.lat, d.lng, d.tag, d.display_picture, d.type, d.rating, dist.district_name,
              h.hotel_id, h.hotel_type, h.price_level as hotel_price_level, h.phone_number as hotel_phone, h.website as hotel_website,
              r.restaurant_id, r.cuisine_type, r.price_level as restaurant_price_level, r.phone_number as restaurant_phone, r.website as restaurant_website, r.opening_hours
       FROM destinations d 
       LEFT JOIN districts dist ON d.district_id = dist.district_id 
       LEFT JOIN hotels h ON d.destinationID = h.destination_id
       LEFT JOIN restaurants r ON d.destinationID = r.destination_id
       WHERE d.destinationID IN (${placeholders})`,
      ids,
    );

    const destMap = new Map(destinations.map((d) => [Number(d.destinationID), d]));

    const orderedDestinations = ids
      .map((id) => {
        const d = destMap.get(Number(id));
        if (!d) return null;
        // Ignore hotels and restaurants as main attraction stops
        if (d.type === "hotel" || d.type === "restaurant") {
          return null;
        }
        let parsedTag = d.tag;
        if (typeof d.tag === "string") {
          try {
            parsedTag = JSON.parse(d.tag);
          } catch (e) {
            parsedTag = [d.tag];
          }
        }
        return {
          ...d,
          type: d.type || "attraction",
          tag: parsedTag,
        };
      })
      .filter(Boolean);

    // Calculate route segments between consecutive destinations
    const routeSegments = [];
    for (let i = 0; i < orderedDestinations.length - 1; i++) {
      const fromDest = orderedDestinations[i];
      const toDest = orderedDestinations[i + 1];

      try {
        const routes = await getCandidateRoutes(fromDest.destinationID, [{ id: toDest.destinationID }]);
        if (routes && routes.length > 0) {
          routeSegments.push({
            from: fromDest.destinationID.toString(),
            to: toDest.destinationID.toString(),
            distance: formatDistance(routes[0].distance),
            duration: formatDuration(routes[0].duration),
            transport: "car"
          });
        } else {
          routeSegments.push({
            from: fromDest.destinationID.toString(),
            to: toDest.destinationID.toString(),
            distance: "Unknown",
            duration: "Unknown",
            transport: "car"
          });
        }
      } catch (err) {
        console.error(`Error fetching route segment between ${fromDest.destinationID} and ${toDest.destinationID}:`, err);
        routeSegments.push({
          from: fromDest.destinationID.toString(),
          to: toDest.destinationID.toString(),
          distance: "Unknown",
          duration: "Unknown",
          transport: "car"
        });
      }
    }

    // Enrich milestones with actual place details (lunch, dinner, overnight)
    const enrichedMilestones = [];
    for (const m of rawMilestones) {
      if ((m.type === "lunch" || m.type === "dinner") && m.restaurantId) {
        const restaurant = await getRestaurantById(m.restaurantId);
        enrichedMilestones.push({ ...m, place: restaurant });
      } else if (m.type === "overnight" && m.hotelId) {
        const hotel = await getHotelById(m.hotelId);
        enrichedMilestones.push({ ...m, place: hotel });
      } else {
        enrichedMilestones.push(m);
      }
    }

    result.push({
      session_id: session.session_id,
      destinations: orderedDestinations,
      routeSegments,
      startTime,
      endTime,
      milestones: enrichedMilestones,
    });
  }

  return result;
}

/**
 * Update milestone selection (lunch restaurant, dinner restaurant, night hotel, or ignore) in session
 */
async function updateSessionMilestone(sessionId, userId, { type, day = 1, placeId = null, status = "selected" }) {
  const [sessions] = await db.execute(
    "SELECT session_id, travel_plan FROM user_travel_sessions WHERE session_id = ? AND user_id = ? LIMIT 1",
    [sessionId, userId]
  );

  if (!sessions.length) {
    throw new Error("Session not found or access denied");
  }

  let plan;
  try {
    plan = typeof sessions[0].travel_plan === "string"
      ? JSON.parse(sessions[0].travel_plan)
      : sessions[0].travel_plan;
  } catch (err) {
    plan = {};
  }

  if (Array.isArray(plan)) {
    plan = {
      checkpoints: plan,
      startTime: "08:30",
      endTime: "20:00",
      milestones: []
    };
  }

  if (!Array.isArray(plan.milestones)) {
    plan.milestones = [];
  }

  const existingIdx = plan.milestones.findIndex(
    (m) => m.type === type && (m.day || 1) === (day || 1)
  );

  const milestoneEntry = {
    type,
    day: day || 1,
    restaurantId: (type === "lunch" || type === "dinner") ? placeId : undefined,
    hotelId: type === "overnight" ? placeId : undefined,
    status: status || (placeId ? "selected" : "ignored")
  };

  if (existingIdx >= 0) {
    plan.milestones[existingIdx] = milestoneEntry;
  } else {
    plan.milestones.push(milestoneEntry);
  }

  await db.execute(
    "UPDATE user_travel_sessions SET travel_plan = ? WHERE session_id = ?",
    [JSON.stringify(plan), sessionId]
  );

  // Return the enriched milestone
  let placeDetails = null;
  if ((type === "lunch" || type === "dinner") && placeId) {
    placeDetails = await getRestaurantById(placeId);
  } else if (type === "overnight" && placeId) {
    placeDetails = await getHotelById(placeId);
  }

  return {
    ...milestoneEntry,
    place: placeDetails
  };
}

module.exports = {
  getAllItinerary,
  updateSessionMilestone,
};
