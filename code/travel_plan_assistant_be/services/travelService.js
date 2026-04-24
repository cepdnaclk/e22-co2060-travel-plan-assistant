const { resolveDestination, validateFeasibility } = require("./distanceService");
const { expandFrontierUntilTarget } = require("./plannerService");

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
    endPlace = null
) {

    if (!startPlace) {
        throw new Error("Starting location required");
    }

    if (!endPlace && desiredPlaces.length === 0) {
        throw new Error("Need at least one desired location or end location");
    }

    // STEP 1: resolve all inputs
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

    const checkpoints = [start, ...desired, end];

    // STEP 2: feasibility check (unchanged)
    const feasibility = await validateFeasibility(
        startPlace,
        desiredPlaces,
        availableTime,
        endPlace
    );

    // STEP 3: final merged route
    const fullPath = [];
    const visited = new Set();

    let totalTime = 0;
    let totalDistance = 0;

    const trace = [];

    // STEP 4: build segment-by-segment path
    for (let i = 0; i < checkpoints.length - 1; i++) {

        const from = checkpoints[i];
        const to = checkpoints[i + 1];

        console.log(`\n===== SEGMENT ${from.name} -> ${to.name} =====`);

        const segment = await expandFrontierUntilTarget(
            from.id,
            to.id,
            visited
        );

        if (!segment || !segment.path) {
            throw new Error(`Failed to build segment ${from.name} -> ${to.name}`);
        }

        // STEP 5: merge path
        const cleanPath = sanitizePath(segment.path);

        fullPath.push(...cleanPath);

        // STEP 6: accumulate stats
        totalTime += segment.totalTime || 0;
        totalDistance += segment.totalDistance || 0;

        // STEP 7: mark visited
        for (const node of cleanPath) {
            visited.add(node.id);
        }

        // STEP 8: trace logging (optional debug)
        if (segment.trace) {
            trace.push({
                from: from.id,
                to: to.id,
                path: cleanPath.map(n => n.id),
                candidates: segment.trace
            });
        }
    }

    // STEP 9: remove duplicates in final path
    const uniquePath = [];
    const seen = new Set();

    for (const node of fullPath) {
        if (seen.has(node.id)) continue;
        seen.add(node.id);
        uniquePath.push(node);
    }

    // STEP 10: return final result
    return {
        feasible: feasibility.feasible,
        warning: feasibility.warning || null,
        suggestedPath: feasibility.suggestedPath || null,

        path: uniquePath.map(n => n.name),

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