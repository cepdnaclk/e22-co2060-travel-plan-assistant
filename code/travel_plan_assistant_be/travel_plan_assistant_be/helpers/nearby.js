// helpers/nearby.js

const { getDestinationWithinRadius, nearbyExists} = require("../services/nearbyService");
const { insertNearbyDestination } = require("../services/nearbyService");
const { getDistanceAndDuration} = require("../services/routeService");
const { safeORSCall, sleep } = require("./safeORS");

/**
 * Find nearby destinations.
 * Expands radius until at least targetCount found,
 * or maxKm reached.
 */
async function getNearbyDestinations(
    lat,
    lng,
    maxKm = 25,
    stepKm = 1,
    targetCount = 5
) {

    const allRows = [];

    for (let radius = stepKm; radius <= maxKm; radius += stepKm) {

        const radiusMeters = radius * 1000;

        const rows = await getDestinationWithinRadius(
            lat,
            lng,
            radiusMeters
        );

        for (const row of rows) {

            const exists = allRows.find(
                r => r.destinationID === row.destinationID
            );

            if (!exists) {
                allRows.push(row);
            }
        }

        if (allRows.length >= targetCount) {
            break;
        }
    }

    return allRows
        .sort((a, b) => a.distance - b.distance)
        .slice(0, targetCount);
}

/**
 * Populate nearby destinations for a given destination
 * @param {string} destinationID - ID of the source destination
 * @param {number} lat - Latitude of the source destination
 * @param {number} lng - Longitude of the source destination
 */
async function populateNearby(destinationID, lat, lng) {

    const nearbyRows = await getNearbyDestinations(lat, lng);

    if (!nearbyRows || nearbyRows.length === 0) return;

    for (const target of nearbyRows) {

        if (target.destinationID === destinationID) continue;

        // Skip duplicates
        if (await nearbyExists(destinationID, target.destinationID)) continue;

        const routeinfo = await safeORSCall(() =>
            getDistanceAndDuration(lat, lng, target.lat, target.lng)
        );

        await sleep(300); // IMPORTANT: throttle even on success

        if (!routeinfo) {
            console.warn(`No route data found for ${destinationID} → ${target.destinationID}, skipped`);
            continue;
        }

        // Insert route
        const src = Math.min(destinationID, target.destinationID);
        const dest = Math.max(destinationID, target.destinationID);

        await insertNearbyDestination(
            src,
            dest,
            routeinfo.distance,
            routeinfo.duration
        );
    }
}

module.exports = { 
    getNearbyDestinations,
    populateNearby
};