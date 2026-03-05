// helpers/nearby.js
const db = require("../config/db");
const { formatNearbyID } = require("../services/idService");
const { getDestinationWithinRadius, nearbyExists} = require("../services/nearbyService");
const { insertNearbyDestination } = require("../services/nearbyService");
const { updateNearbyColumn } = require("../services/nearbyService");
const { getDistanceAndDuration} = require("../services/routeService");

/**
 * Get nearby destinations within 100m increments up to maxKm
 */
async function getNearbyDestinations(lat, lng, maxKm = 5, stepKm = 0.1) {
    const allRows = [];

    for (let radius = stepKm; radius <= maxKm; radius += stepKm) {
        const radiusMeters = radius * 1000;
        const rows = await getDestinationWithinRadius(lat, lng, radiusMeters);

        for (const row of rows) {
            if (!allRows.find(r => r.destinationID === row.destinationID)) {
                allRows.push(row);
            }
        }
    }

    return allRows;
}

/**
 * Populate nearby destinations for a given destination
 * @param {string} destinationID - ID of the source destination
 * @param {number} lat - Latitude of the source destination
 * @param {number} lng - Longitude of the source destination
 */
async function populateNearby(destinationID, lat, lng) {

    const nearbyRows = await getNearbyDestinations(lat, lng, 5, 0.1);

    if (!nearbyRows || nearbyRows.length === 0) return;

    for (const target of nearbyRows) {

        if (target.destinationID === destinationID) continue;

        const nearbyID = formatNearbyID(destinationID, target.destinationID);

        // Skip duplicates
        if (await nearbyExists(nearbyID)) continue;

        const routeinfo = await getDistanceAndDuration(
            lat,
            lng,
            target.lat,
            target.lng
        );

        if (!routeinfo) {
            console.warn(`No route data found for ${nearbyID}, skipped`);
            continue;
        }

        // Insert route
        await insertNearbyDestination(
            nearbyID,
            routeinfo.distance,
            routeinfo.duration
        );

        // Update BOTH destinations
        await updateNearbyColumn(
            destinationID,
            target.destinationID,
            nearbyID
        );
    }
}

module.exports = { 
    getNearbyDestinations,
    populateNearby
};