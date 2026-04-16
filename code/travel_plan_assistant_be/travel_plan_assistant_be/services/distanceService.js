const db = require("../config/db");
const { getDistanceAndDuration } = require("./routeService");
const { findByName } = require("./destinationService");
const { saveDestination } = require("../helpers/saveDestination");
const { insertNearbyDestination } = require("./nearbyService");

// Check the nearby_destination table for route details
async function getCachedRoute(sourceID, destinationID) {

    const a = Math.min(sourceID, destinationID);
    const b = Math.max(sourceID, destinationID);

    const [rows] = await db.execute(
        `SELECT distance, duration 
         FROM nearby_destinations 
         WHERE source_id = ? AND destination_id = ? 
         LIMIT 1`,
        [a, b]
    );

    return rows.length ? rows[0] : null;
}

// Check if the given src and dest exist in database if not save the destination
// Returns the ID
async function resolveDestination(placeName) {

    let dest = await findByName(placeName);

    if (!dest) {
        const saved = await saveDestination(placeName);

        if (!saved) {
            throw new Error(`Failed to save destination: ${placeName}`);
        }

        dest = saved;
    }

    return dest;
}

/**
 * Main function:
 * Get route info between two place names
 */
async function getRouteInfo(fromName, toName) {

    // Resolve both places (DB + insert if missing)
    const from = await resolveDestination(fromName);
    const to = await resolveDestination(toName);

    if (!from || !to) {
        throw new Error("Invalid source or destination");
    }

    // Check nearby_destinations first
    const cached = await getCachedRoute(from.id, to.id);

    if (cached) {
        return {
            distance: Number(cached.distance),
            duration: Number(cached.duration),
            cached: true
        };
    }

    // ORS call if not found in nearby_destinations
    const result = await getDistanceAndDuration(
        from.lat,
        from.lng,
        to.lat,
        to.lng
    );

    if (!result) {
        throw new Error("ORS failed to calculate route");
    }

    // Save the new ORS data to DB
    await insertNearbyDestination(
        from.id,
        to.id,
        result.distance,
        result.duration
    );

    return {
        distance: result.distance,
        duration: result.duration,
        cached: false
    };
}


module.exports = {
    getCachedRoute,
    resolveDestination,
    getRouteInfo
};