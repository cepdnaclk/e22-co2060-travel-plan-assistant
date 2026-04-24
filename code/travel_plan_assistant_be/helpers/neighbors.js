const { getSpatialCandidates, getCandidateRoutes, getValidNeighbors } = require("../services/neighborService");

/**
 * Returns all connected neighbors of a destination.
 * Uses bidirectional edges from nearby_destinations table.
 *
 * @param {number} destinationID
 * @returns {Array<{id:number, distance:number, duration:number}>}
 */
async function getNeighbors(destinationID) {

    const SPATIAL_RADIUS_KM = 10;
    const LIMIT = 10;
    const MAX_ROUTE_KM = 25;

    // 1. Get spatial candidates
    const candidates = await getSpatialCandidates(
        destinationID,
        SPATIAL_RADIUS_KM,
        LIMIT
    );

    // 2. Get cached/API route data
    const routes = await getCandidateRoutes(
        destinationID,
        candidates
    );


    // 3. Keep only valid neighbors
    const validNeighbors = getValidNeighbors(
        routes,
        MAX_ROUTE_KM
    );

    return validNeighbors;
}

module.exports = {
    getNeighbors
};