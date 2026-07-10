const db = require("../config/db");
const { getCandidateRoutes } = require("./neighborService");

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
    // Parse travel_plan (handle JSON string or array)
    let ids;
    try {
      ids =
        typeof session.travel_plan === "string"
          ? JSON.parse(session.travel_plan)
          : session.travel_plan;
    } catch (err) {
      console.error("Invalid JSON in travel_plan:", session.travel_plan);
      continue;
    }

    // Skip empty plans
    if (!Array.isArray(ids) || ids.length === 0) continue;

    const placeholders = ids.map(() => "?").join(",");

    const [destinations] = await db.execute(
      `SELECT d.destinationID, d.name, d.description, d.lat, d.lng, d.tag, d.display_picture, dist.district_name
       FROM destinations d INNER JOIN districts dist ON d.district_id = dist.district_id 
       WHERE d.destinationID IN (${placeholders})`,
      ids,
    );

    const destMap = new Map(destinations.map((d) => [d.destinationID, d]));

    const orderedDestinations = ids
      .map((id) => destMap.get(id))
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

    result.push({
      session_id: session.session_id,
      destinations: orderedDestinations,
      routeSegments,
    });
  }

  return result;
}

module.exports = {
  getAllItinerary,
};

