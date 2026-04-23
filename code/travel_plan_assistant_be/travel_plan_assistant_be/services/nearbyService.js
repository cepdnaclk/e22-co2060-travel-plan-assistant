const db = require("../config/db");

async function nearbyExists(sourceID, destinationID) {
    const a = Math.min(sourceID, destinationID);
    const b = Math.max(sourceID, destinationID);

    const [rows] = await db.execute(
        `SELECT 1 
         FROM nearby_destinations 
         WHERE source_id = ? AND destination_id = ?
         LIMIT 1`,
        [a, b]
    );

    return rows.length > 0;
}

/**
 * Get nearby destinations within a given radius from a point
 * @param {number} lat - Latitude of center point
 * @param {number} lng - Longitude of center point
 * @param {number} radius - Radius in meters
 * @returns {Promise<Array>} - Array of destination objects with distance
 */
async function getDestinationWithinRadius(lat, lng, radius = 5000) {

    const [rows] = await db.execute(
        `SELECT destinationID, district_id, name, lat, lng,
                ST_Distance_Sphere(coords, POINT(?, ?)) AS distance
         FROM destinations
         HAVING distance <= ? AND distance > 0
         ORDER BY distance ASC`,
        [lng, lat, radius]
    );

    return rows;
}
/**
 * Insert a nearby destination relationship into the DB
 * @param {string} nearbyID - Unique ID for this nearby relation (source-target)
 * @param {number} distance - Distance in km
 * @param {number} duration - Duration in minutes
 */
async function insertNearbyDestination(source_id, destination_id, distance, duration) {

    const a = Math.min(source_id, destination_id);
    const b = Math.max(source_id, destination_id);

    await db.execute(
        `INSERT IGNORE INTO nearby_destinations
        (source_id, destination_id, distance, duration)
        VALUES (?,?,?,?)`,
        [a, b, distance, duration]
    );

}

module.exports = { 
    getDestinationWithinRadius,
    insertNearbyDestination,
    nearbyExists
};