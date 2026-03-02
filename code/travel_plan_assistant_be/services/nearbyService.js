const db = require("../config/db");

/**
 * Get nearby destinations within a given radius from a point
 * @param {number} lat - Latitude of center point
 * @param {number} lng - Longitude of center point
 * @param {number} radius - Radius in meters
 * @returns {Promise<Array>} - Array of destination objects with distance
 */
async function getDestinationWithinRadius(lat, lng, radius) {
    const [rows] = await db.execute(
        `SELECT destinationID, name, lat, lng,
                ST_Distance_Sphere(coords, POINT(?, ?)) AS distance
        FROM destinations
        WHERE ST_Distance_Sphere(coords, POINT(?, ?)) <= ?
        ORDER BY distance ASC`,
        [lng, lat, lng, lat, radius]
    );

    return rows
}

/**
 * Insert a nearby destination relationship into the DB
 * @param {string} nearbyID - Unique ID for this nearby relation (source-target)
 * @param {number} distance - Distance in km
 * @param {number} duration - Duration in minutes
 */
async function insertNearbyDestination(nearbyID, distance, duration) {
    await db.execute(
        `INSERT INTO nearby_destinations
        (nearbyID, distance_km, duration_min)
        VALUES (?,?,?)`,
        [nearbyID, distance, duration]
    );
}

/**
 * Update the 'nearby' column in the destinations table
 * @param {string} destinationID
 * @param {string[]} nearbyIDs - array of nearbyIDs to store
 */

async function updateNearbyColumn(destinationID, nearbyIDs) {
    if (!nearbyIDs || !destinationID) return;

    await db.execute(
        `UPDATE destinations SET nearby = ? WHERE destinationID = ?`,
        [nearbyIDs.join(","), destinationID]
    );
}

module.exports = { 
    getDestinationWithinRadius,
    insertNearbyDestination,
    updateNearbyColumn
};