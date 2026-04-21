const db = require("../config/db");

const { findByID } = require("./destinationService");
const { getDistance } = require("../helpers/utils");
const { getDistanceAndDuration } = require("./routeService");
const { insertNearbyDestination } = require("./nearbyService"); 

/**
 * Returns all connected neighbors of a destination.
 * Uses bidirectional edges from nearby_destinations table.
 *
 * @param {number} destinationID
 * @returns {Array<{id:number, distance:number, duration:number}>}
 */
async function getNeighbors(destinationID) {

    const [rows] = await db.execute(
        `
        SELECT 
            CASE
                WHEN source_id = ? THEN destination_id
                ELSE source_id
            END AS neighborID,
            distance,
            duration
        FROM nearby_destinations
        WHERE source_id = ? OR destination_id = ?
        ORDER BY distance ASC
        `,
        [destinationID, destinationID, destinationID]
    );

    return rows.map(row => ({
        id: row.neighborID,
        distance: parseFloat(row.distance),
        duration: parseFloat(row.duration)
    }));
}

/**
 * Selects next node based on route style.
 *
 * shortest → closest neighbor
 * average  → middle-ranked neighbor
 * longest  → farthest neighbor
 */
function chooseNeighborByStyle(style, neighbors, visited = new Set()) {

    const valid = neighbors.filter(
        node => !visited.has(node.id)
    );

    if (valid.length === 0) return null;

    if (style === "shortest") {
        return valid[0];
    }

    if (style === "average") {
        const index = Math.floor((valid.length - 1) / 2);
        return valid[index];
    }

    if (style === "longest") {
        return valid[valid.length - 1];
    }

    return null;
}

/**
 * Filters neighbors that move closer toward target destination.
 * Uses haversine distance heuristic.
 */
async function filterTowardTarget(currentID, targetID, neighbors) {

    const current = await findByID(currentID);
    const target = await findByID(targetID);

    if (!current || !target) return neighbors;

    const currentDistance = getDistance(
        current.lat,
        current.lng,
        target.lat,
        target.lng
    );

    const filtered = [];

    for (const node of neighbors) {

        const place = await findByID(node.id);

        if (!place) continue;

        const nextDistance = getDistance(
            place.lat,
            place.lng,
            target.lat,
            target.lng
        );

        if (nextDistance < currentDistance) {
            filtered.push(node);
        }
    }

    return filtered.length ? filtered : neighbors;
}

/**
 * Builds 3 parallel route variants between two nodes:
 * shortest, average, longest.
 *
 * Each style expands independently using bidirectional search logic.
 */
async function buildThreeStyledSegmentPaths(startID, endID, visitedGlobal = new Set()) {

    const styles = ["shortest", "average", "longest"];

    const results = {};

    for (const style of styles) {

        const result = await buildSingleStylePath(
            startID,
            endID,
            style,
            new Set(visitedGlobal[style] || [])
        );

        results[style] = result;
    }

    return results;
}

/**
 * Core bidirectional expansion engine for a single style.
 * Expands forward and backward simultaneously until:
 * - meet condition is satisfied OR
 * - max iteration reached OR
 * - no expansion possible
 */
async function buildSingleStylePath(startID, endID, style, visited) {

    let forward = [await findByID(startID)];
    let backward = [await findByID(endID)];

    let forwardFrontierIDs = new Set([startID]);
    let backwardFrontierIDs = new Set([endID]);

    visited.add(startID);

    let steps = 0;
    const MAX_STEPS = 50;

    while (steps < MAX_STEPS) {

        steps++;

        // expand forward
        const newForward = await expandFrontier(
            forwardFrontierIDs,
            endID,
            style,
            visited
        );

        // expand backward
        const newBackward = await expandFrontier(
            backwardFrontierIDs,
            startID,
            style,
            visited
        );

        forward = forward.concat(newForward.added);
        backward = backward.concat(newBackward.added);

        forwardFrontierIDs = newForward.frontier;
        backwardFrontierIDs = newBackward.frontier;

        // CHECK MEET CONDITION
        const meet = await checkMeetCondition(
            forwardFrontierIDs,
            backwardFrontierIDs
        );

        if (meet) {

            const path = await stitchPaths(
                forward,
                backward,
                meet
            );

            return finalizePath(path, style);
        }

        // if no expansion possible
        if (forwardFrontierIDs.size === 0 && backwardFrontierIDs.size === 0) {
            break;
        }
    }

    // fallback ORS connect
    return await fallbackORSConnect(forward, backward, startID, endID, style);
}

/**
 * Expands current frontier by selecting next best node
 * based on style + directional filtering.
 */
async function expandFrontier(frontier, targetID, style, visited) {

    const nextFrontier = new Set();
    const added = [];

    for (const nodeID of frontier) {

        const neighbors = await getNeighbors(nodeID);

        const directTarget = neighbors.find(
            n => n.id === targetID
        );

        if (directTarget && !visited.has(targetID)) {

            const fullNode = await findByID(targetID);

            visited.add(targetID);
            nextFrontier.add(targetID);
            added.push(fullNode);

            continue;
        }

        const filtered = await filterTowardTarget(
            nodeID,
            targetID,
            neighbors
        );

        const chosen = chooseNeighborByStyle(
            style,
            filtered,
            visited
        );

        if (!chosen) continue;

        const fullNode = await findByID(chosen.id);

        if (!fullNode) continue;

        if (!visited.has(fullNode.id)) {

            visited.add(fullNode.id);

            nextFrontier.add(fullNode.id);

            added.push(fullNode);
        }
    }

    return {
        frontier: nextFrontier,
        added
    };
}

/**
 * Checks if forward and backward frontiers can connect
 * using existing graph edges.
 */
async function checkMeetCondition(forwardFrontierIDs, backwardFrontierIDs) {

    for (const a of forwardFrontierIDs) {
        for (const b of backwardFrontierIDs) {

            const neighbors = await getNeighbors(a);

            const match = neighbors.find(n => n.id === b);

            if (match) {
                return { meetNodeA: a, meetNodeB: b };
            }
        }
    }

    return null;
}   

/**
 * Merges forward and backward paths at meeting point.
 */
async function stitchPaths(forward, backward, meet) {

    const idxA = forward.findIndex(n => n.id === meet.meetNodeA);
    const idxB = backward.findIndex(n => n.id === meet.meetNodeB);

    const left = forward.slice(0, idxA + 1);
    const right = backward.slice(0, idxB + 1).reverse();

    return [...left, ...right];
}

/**
 * Uses ORS as fallback when graph-based meeting fails.
 * Also caches route into nearby_destinations table.
 */
async function fallbackORSConnect(forward, backward, startID, endID, style) {

    const lastForward = forward[forward.length - 1];
    const firstBackward = backward[backward.length - 1];

    const route = await getDistanceAndDuration(
        lastForward.lat,
        lastForward.lng,
        firstBackward.lat,
        firstBackward.lng
    );

    if (!route) {
        return null;
    }

    // CACHE INTO DB (IMPORTANT RULE YOU SET)
    await insertNearbyDestination(
        lastForward.id,
        firstBackward.id,
        route.distance,
        route.duration
    );

    const right = [...backward].reverse();

    if (
        forward.length &&
        right.length &&
        forward[forward.length - 1].id === right[0].id
    ) {
        right.shift();
    }


    return {
        path: [...forward, ...right],
        totalDistance: route.distance,
        totalTime: route.duration,
        feasible: true,
        style
    };
}

function finalizePath(path, style) {

    return {
        path,
        totalDistance: 0,
        totalTime: 0,
        feasible: true,
        style
    };
}

module.exports = {
    getNeighbors,
    chooseNeighborByStyle,
    filterTowardTarget,
    buildThreeStyledSegmentPaths,
    buildSingleStylePath,
    expandFrontier,
    checkMeetCondition,
    stitchPaths,
    fallbackORSConnect,
    finalizePath
};