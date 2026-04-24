const db = require("../config/db");

const { findByID } = require("./destinationService");

const { getDistanceAndDuration, getDistanceAndDurationByID } = require("./routeService");
const { insertNearbyDestination } = require("./nearbyService"); 
const { filterTowardTarget } = require("./directionalService"); 
const { getCandidateRoutes } = require("./neighborService"); 
const { findDirectionalCandidate } = require("../helpers/directional"); 
 

const { getNeighbors } = require("../helpers/neighbors");

/**
 * Selects next node based on route style.
 *
 * shortest → closest neighbor
 * average  → middle-ranked neighbor
 * longest  → farthest neighbor
 */
function chooseNeighborByStyle(style, neighbors, visited = new Set()) {

    const MAX_NEIGHBOR_KM = 25;

    const valid = neighbors.filter(
        node =>
            !visited.has(node.id) &&
            node.distance <= MAX_NEIGHBOR_KM
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
async function buildSingleStylePath(startID, endID, style) {

    let trace = [];

    let forward = [await findByID(startID)];
    let backward = [await findByID(endID)];

    let forwardFrontier = new Set([startID]);
    let backwardFrontier = new Set([endID]);

    // 🔥 CRITICAL: separate visited sets
    let visitedForward = new Set([startID]);
    let visitedBackward = new Set([endID]);

    let steps = 0;
    const MAX_STEPS = 50;

    while (steps < MAX_STEPS) {

        steps++;

        const newForward = await expandFrontier(
            forwardFrontier,
            endID,
            visitedForward
        );

        const newBackward = await expandFrontier(
            backwardFrontier,
            startID,
            visitedBackward
        );

        forward = forward.concat(newForward.added);
        backward = backward.concat(newBackward.added);

        forwardFrontier = newForward.frontier;
        backwardFrontier = newBackward.frontier;

        trace.push({
            step: steps,
            forwardFrontier: [...forwardFrontier],
            backwardFrontier: [...backwardFrontier],
            forwardAdded: newForward.added.map(n => n.id),
            backwardAdded: newBackward.added.map(n => n.id)
        });

        // ✅ REAL MEET CONDITION
        const meetNode = checkMeetCondition(forwardFrontier, backwardFrontier);

        if (meetNode) {

            trace.push({
                event: "MEET",
                node: meetNode.nodeId
            });

            const path = await stitchPaths(
                forward,
                backward,
                meetNode.nodeId
            );

            return {
                ...finalizePath(path, style),
                trace
            };
        }

        if (forwardFrontier.size === 0 && backwardFrontier.size === 0) {
            break;
        }
    }

    const fallback = await fallbackORSConnect(
        forward,
        backward,
        startID,
        endID,
        style
    );

    return {
        ...fallback,
        trace
    };
}

/**
 * Expands current frontier by selecting next best node
 * based on style + directional filtering.
 */
async function expandFrontier(frontier, targetID, visited) {

    const nextFrontier = new Set();
    const added = [];

    for (const nodeID of frontier) {

        // STEP 1: get normal neighbors
        const neighbors = await getNeighbors(nodeID);

        // STEP 2: strict toward-target filter
        let candidates = await filterTowardTarget(
            nodeID,
            targetID,
            neighbors
        );

        // STEP 3: fallback only if empty
        if (!candidates || candidates.length === 0) {

            const fallback = await findDirectionalCandidate(
                nodeID,
                targetID
            );

            if (fallback) {
                candidates = [fallback];
            } else {
                continue;
            }
        }

        // STEP 4: choose first valid unvisited candidate
        let chosen = null;

        for (const c of candidates) {
            if (!visited.has(c.id)) {
                chosen = c;
                break;
            }
        }

        if (!chosen) {
            continue;
        }

        // STEP 5: load full node
        const fullNode = await findByID(chosen.id);

        if (!fullNode) {
            continue;
        }

        // STEP 6: commit
        visited.add(fullNode.id);
        nextFrontier.add(fullNode.id);

        added.push({
            ...fullNode,
            parentID: nodeID
        });

        console.log(`✅ ${nodeID} -> ${fullNode.id} (${fullNode.name})`);
    }

    return {
        frontier: nextFrontier,
        added
    };
}

async function expandFrontierUntilTarget(
    startID,
    targetID,
    visited = new Set()
) {

    let frontier = new Set([startID]);

    visited.add(startID);

    const parentMap = new Map();
    const nodeMap = new Map();

    const startNode = await findByID(startID);

    if (startNode) {
        nodeMap.set(startID, startNode);
    }

    let safety = 0;
    const MAX_STEPS = 50;

    while (frontier.size > 0 && safety < MAX_STEPS) {

        safety++;

        const result = await expandFrontier(
            frontier,
            targetID,
            visited
        );

        const nextFrontier = result.frontier;
        const added = result.added || [];

        for (const node of added) {

            parentMap.set(
                node.id,
                node.parentID
            );

            nodeMap.set(node.id, {
                id: node.id,
                name: node.name,
                lat: node.lat,
                lng: node.lng
            });
        }

        if (nextFrontier.has(targetID)) {

            console.log("🎯 TARGET REACHED:", targetID);

            return await buildSegmentPath(
                startID,
                targetID,
                parentMap,
                nodeMap
            );
        }

        frontier = nextFrontier;
    }

    console.log("❌ Target not reached");

    return null;
}

async function buildSegmentPath(
    startID,
    targetID,
    parentMap,
    nodeMap
) {

    const ids = [];
    let current = targetID;

    while (current != null) {

        ids.unshift(current);

        if (current === startID) {
            break;
        }

        current = parentMap.get(current);
    }

    if (ids[0] !== startID) {
        return null;
    }

    const path = ids.map(id => nodeMap.get(id)).filter(Boolean);

    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < ids.length - 1; i++) {

        const fromID = ids[i];
        const toID = ids[i + 1];

        const routes = await getCandidateRoutes(
            fromID,
            [{ id: toID }]
        );

        if (!routes.length) {
            continue;
        }

        totalDistance += routes[0].distance;
        totalTime += routes[0].duration;
    }

    return {
        path,
        totalDistance,
        totalTime
    };
}
/**
 * Checks if forward and backward frontiers can connect
 * using existing graph edges.
 */
function checkMeetCondition(forwardFrontier, backwardFrontier) {

    for (const id of forwardFrontier) {
        if (backwardFrontier.has(id)) {
            return {
                nodeId: id
            };
        }
    }

    return null;
}

/**
 * Merges forward and backward paths at meeting point.
 */
async function stitchPaths(forward, backward, meet) {

    const meetId = meet.nodeId || meet;

    const idxA = forward.findIndex(n => n.id === meetId);
    const idxB = backward.findIndex(n => n.id === meetId);

    const left = idxA !== -1 ? forward.slice(0, idxA + 1) : forward;
    const right = idxB !== -1
        ? backward.slice(0, idxB + 1).reverse()
        : backward.reverse();

    // remove duplicate meeting node
    if (left.length && right.length && left[left.length - 1].id === right[0].id) {
        right.shift();
    }

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

function getBoundingBox(a, b, padding = 0.2) {

    return {
        minLat: Math.min(a.lat, b.lat) - padding,
        maxLat: Math.max(a.lat, b.lat) + padding,
        minLng: Math.min(a.lng, b.lng) - padding,
        maxLng: Math.max(a.lng, b.lng) + padding
    };
}

function filterInCorridor(current, target, neighbors) {

    const box = getBoundingBox(current, target);

    return neighbors.filter(n => {

        const withinBox =
            n.lat >= box.minLat &&
            n.lat <= box.maxLat &&
            n.lng >= box.minLng &&
            n.lng <= box.maxLng;

        return withinBox;
    });
}

function cosineDirection(lat1, lng1, lat2, lng2, tLat, tLng) {

    const ax = lat2 - lat1;
    const ay = lng2 - lng1;

    const bx = tLat - lat1;
    const by = tLng - lng1;

    const dot = ax * bx + ay * by;

    const magA = Math.sqrt(ax * ax + ay * ay);
    const magB = Math.sqrt(bx * bx + by * by);

    return dot / (magA * magB + 1e-9);
}

module.exports = {
    chooseNeighborByStyle,
    buildThreeStyledSegmentPaths,
    buildSingleStylePath,
    expandFrontier,
    expandFrontierUntilTarget,
    buildSegmentPath,
    checkMeetCondition,
    stitchPaths,
    fallbackORSConnect,
    finalizePath,
    getBoundingBox,
    filterInCorridor,
    cosineDirection
};