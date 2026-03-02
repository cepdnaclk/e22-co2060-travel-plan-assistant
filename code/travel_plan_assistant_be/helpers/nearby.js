// helpers/nearby.js
const db = require("../config/db");
const { getDestinationWithinRadius} = require("../services/nearbyService");

/**
 * Get nearby destinations within 100m increments up to maxKm
 */
async function getNearbyDestinations(lat, lng, maxKm = 5, stepKm = 0.1) {
    for (let radius = stepKm; radius <= maxKm; radius += stepKm) {
        const radiusMeters = radius * 1000;

        // Call nearbyService
        const rows = await getDestinationWithinRadius(lat, lng, radiusMeters)

        if (rows.length > 0) return rows;
    }
    return [];
}

module.exports = { 
    getNearbyDestinations,
};