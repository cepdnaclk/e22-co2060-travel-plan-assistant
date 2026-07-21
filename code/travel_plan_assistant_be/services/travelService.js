const { resolveDestination, validateFeasibility } = require("./distanceService");
const { expandFrontierUntilTarget } = require("./plannerService");
const { getDestinationIdList, saveTravelSession } = require("./sessionService");

/**
 * Remove duplicate nodes while preserving first appearance order
 */
function sanitizePath(path = []) {

    const seen = new Set();
    const clean = [];

    for (const node of path) {

        if (!node || node.id == null) continue;

        if (!seen.has(node.id)) {
            seen.add(node.id);
            clean.push(node);
        }
    }

    return clean;
}

/**
 * Merge segment path into accumulated path
 * Avoid duplicate join node
 */
function mergePaths(existing = [], incoming = []) {

    if (incoming.length === 0) return existing;

    const used = new Set(existing.map(n => n.id));

    for (const node of incoming) {

        if (!used.has(node.id)) {
            existing.push(node);
            used.add(node.id);
        }
    }

    return existing;
}

/**
 * Main orchestration function
 */
async function createTravelPlan(
    startPlace,
    desiredPlaces = [],
    availableTime,
    endPlace = null,
    userId
) {

    if (!startPlace) {
        throw new Error("Starting location required");
    }

    if (!endPlace && desiredPlaces.length === 0) {
        throw new Error("Need at least one desired location or end location");
    }

    const start = await resolveDestination(startPlace);

    const desired = [];
    for (const place of desiredPlaces) {
        desired.push(await resolveDestination(place));
    }

    let end;

    if (endPlace) {
        end = await resolveDestination(endPlace);
    } else {
        end = desired.pop();
    }

    const feasibility = await validateFeasibility(
        startPlace,
        desiredPlaces,
        availableTime,
        endPlace
    );

    const checkpointNames = (feasibility.suggestedPath && feasibility.suggestedPath.length > 0)
        ? feasibility.suggestedPath
        : [startPlace, ...desiredPlaces, endPlace].filter(Boolean);

    const checkpoints = [];
    for (const placeName of checkpointNames) {
        checkpoints.push(await resolveDestination(placeName));
    }

    const fullPath = [];
    const globalVisited = new Set();

    let totalTime = 0;
    let totalDistance = 0;

    const trace = [];

    for (let i = 0; i < checkpoints.length - 1; i++) {

        const from = checkpoints[i];
        const to = checkpoints[i + 1];

        console.log(`\n===== SEGMENT ${from.name} -> ${to.name} =====`);

        const segmentVisited = new Set();

        const segment = await expandFrontierUntilTarget(
            from.id,
            to.id,
            segmentVisited
        );

        // ❌ FIX: prevent crash BEFORE accessing segment.path
        if (!segment || !segment.path) {
            console.log(`❌ Failed segment ${from.name} -> ${to.name}`);
            throw new Error(`Failed to build segment ${from.name} -> ${to.name}`);
        }

        const cleanPath = sanitizePath(segment.path);

        fullPath.push(...cleanPath);

        totalTime += segment.totalTime || 0;
        totalDistance += segment.totalDistance || 0;

        for (const node of cleanPath) {
            globalVisited.add(node.id);
        }

        if (segment.trace) {
            trace.push({
                from: from.id,
                to: to.id,
                path: cleanPath.map(n => n.id),
                candidates: segment.trace
            });
        }
    }

    const uniquePath = [];
    const seen = new Set();

    for (const node of fullPath) {
        if (seen.has(node.id)) continue;
        seen.add(node.id);
        uniquePath.push(node);
    }

    const finalPath = uniquePath.map(n => n.name);

    const destinationIdList = await getDestinationIdList(finalPath);

    const sessionId = await saveTravelSession(userId, destinationIdList);

    let isFeasible = feasibility.feasible;
    let warning = feasibility.warning || null;

    if (totalTime > availableTime + 120) {
        isFeasible = false;
        if (!warning) {
            warning = `Expanded trip travel time (${(totalTime / 60).toFixed(1)}h) exceeds available time budget (${(availableTime / 60).toFixed(1)}h).`;
        }
    }

    return {
        sessionId,

        feasible: isFeasible,
        warning,
        suggestedPath: feasibility.suggestedPath || null,
        skippedLocations: feasibility.skippedLocations || [],

        path: finalPath,

        totalTime: totalTime.toFixed(2),
        totalDistance: totalDistance.toFixed(2),

        checkpoints: checkpoints.map(c => c.name),

        trace
    };
}

module.exports = {
    createTravelPlan,
    sanitizePath
};