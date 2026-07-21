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
        // console.log("Route Cached from database");
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

/**
 * Validate if desired locations can be visited within time budget
 * Uses greedy nearest-next strategy
 *
 * @param {string} startLocation
 * @param {string[]} desiredLocations
 * @param {number} availableTime   // minutes
 *
 * @returns {{
 *   feasible: boolean,
 *   path: string[],
 *   totalTime: number,
 *   totalDistance: number
 * }}
 */

async function validateFeasibility(
    startLocation,
    desiredLocations = [],
    availableTime,
    endLocation = null
) {
    if (!endLocation && desiredLocations.length === 0) {
        throw new Error("Need at least one desired location if no end location is given");
    }

    const tolerance = 120; // 2 hour tolerance window (minutes)
    const limit = availableTime + tolerance;

    let current = startLocation;
    let unvisited = [...desiredLocations];

    if (endLocation) {
        unvisited = unvisited.filter(
            p => p.toLowerCase() !== endLocation.toLowerCase()
        );
    }

    let path = [startLocation];
    let totalTime = 0;
    let totalDistance = 0;

    while (unvisited.length > 0) {
        let bestIndex = -1;
        let bestRoute = null;
        let bestCandidateTime = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const info = await getRouteInfo(current, unvisited[i]);

            let extraEndLegTime = 0;
            if (endLocation && unvisited[i].toLowerCase() !== endLocation.toLowerCase()) {
                try {
                    const endLegInfo = await getRouteInfo(unvisited[i], endLocation);
                    extraEndLegTime = endLegInfo.duration + 45;
                } catch (err) {
                    extraEndLegTime = 60;
                }
            }

            const predictedTimeWithEnd = totalTime + (info.duration + 45) + extraEndLegTime;

            if (predictedTimeWithEnd <= limit && info.duration < bestCandidateTime) {
                bestCandidateTime = info.duration;
                bestIndex = i;
                bestRoute = info;
            }
        }

        if (bestIndex === -1) break;

        const nextPlace = unvisited.splice(bestIndex, 1)[0];
        path.push(nextPlace);
        totalTime += bestRoute.duration + 45;
        totalDistance += bestRoute.distance;
        current = nextPlace;
    }

    // handle end location
    if (endLocation && current.toLowerCase() !== endLocation.toLowerCase()) {
        const finalLeg = await getRouteInfo(current, endLocation);
        totalTime += finalLeg.duration + 45;
        totalDistance += finalLeg.distance;
        path.push(endLocation);
    }

    const isWithinBudget = totalTime <= availableTime;
    const isWithinTolerance = totalTime <= limit;
    const isFeasible = isWithinBudget && unvisited.length === 0;

    let warning = null;

    if (!isFeasible) {
        if (unvisited.length > 0) {
            warning = `Trip time budget exceeded (${Math.round(availableTime / 60)}h max). Could not include all requested locations: ${unvisited.join(", ")}`;
        } else if (!isWithinBudget && isWithinTolerance) {
            warning = "Trip slightly exceeds target duration but is within 2-hour tolerance.";
        } else {
            warning = "Trip total duration exceeds available time for selected date range.";
        }
    }

    return {
        feasible: isFeasible,
        warning,
        suggestedPath: path,
        skippedLocations: unvisited,
        totalTime: +totalTime.toFixed(2),
        totalDistance: +totalDistance.toFixed(2)
    };
}


module.exports = {
    getCachedRoute,
    resolveDestination,
    getRouteInfo,
    validateFeasibility
};