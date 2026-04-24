const db = require("../config/db");
const { getDistanceAndDurationByID } = require("./routeService");
const { insertNearbyDestination } = require("./nearbyService");
const { filterTowardTarget } = require("./directionalService");

async function getSpatialCandidates(destinationID, radiusKm = 10, limit = 10) {

    const radiusMeters = radiusKm * 1000;

    const [rows] = await db.execute(
        `
        SELECT 
            destinationID,
            ST_Distance_Sphere(
                coords,
                (SELECT coords FROM destinations WHERE destinationID = ?)
            ) AS distance
        FROM destinations
        WHERE destinationID != ?
        ORDER BY distance ASC
        `,
        [destinationID, destinationID]
    );

    // filter in JS (more stable than SQL edge cases)
    const filtered = rows
        .map(r => ({
            id: r.destinationID,
            distance: Number(r.distance)
        }))
        .filter(r => r.distance <= radiusMeters)
        .slice(0, limit);

    return filtered;
}

async function getCandidateRoutes(sourceID, candidates = []) {

    const routes = [];

    for (const c of candidates) {

        const targetID = c.id;

        // 1. check cache first
        const [cached] = await db.execute(
            `
            SELECT distance, duration
            FROM nearby_destinations
            WHERE (source_id = ? AND destination_id = ?)
               OR (source_id = ? AND destination_id = ?)
            LIMIT 1
            `,
            [sourceID, targetID, targetID, sourceID]
        );

        // console.log("Returned from Database");

        let edge = cached[0] ? normalizeEdge(cached[0]) : null;

        // 2. API fallback if missing
        if (!edge) {

            console.log("\n================================================ Calling API ========================================================================\n");
            const apiResult = await getDistanceAndDurationByID(
                sourceID,
                targetID
            );

            if (!apiResult || apiResult.distance == null) {
                continue;
            }

            edge = normalizeEdge(apiResult);

            // store cache
            await insertNearbyDestination(
                sourceID,
                targetID,
                edge.distance,
                edge.duration
            );
        }

        routes.push({
            id: targetID,
            distance: edge.distance,
            duration: edge.duration
        });
    }

    return routes.sort((a, b) => a.distance - b.distance);
}


function getValidNeighbors(routes = [], maxKm = 25) {

    return routes
        .filter(route =>
            route &&
            typeof route.distance === "number" &&
            !isNaN(route.distance) &&
            route.distance <= maxKm
        )
        .sort((a, b) => a.distance - b.distance);
}

function normalizeEdge(edge) {
    return {
        distance: Number(edge.distance),
        duration: Number(edge.duration)
    };
}



module.exports = {
    getSpatialCandidates,
    getCandidateRoutes,
    getValidNeighbors,
    normalizeEdge
};