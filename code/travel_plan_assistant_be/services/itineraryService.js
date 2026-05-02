const db = require("../config/db");

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

    result.push({
      session_id: session.session_id,
      destinations: orderedDestinations,
    });
  }

  return result;
}

module.exports = {
  getAllItinerary,
};
