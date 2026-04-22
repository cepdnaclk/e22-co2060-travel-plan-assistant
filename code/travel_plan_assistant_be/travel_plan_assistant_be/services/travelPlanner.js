const { resolveDestination, validateFeasibility } = require("./distanceService");
const { buildThreeStyledSegmentPaths } = require("./plannerService");

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

    const checkpoints = [
        start,
        ...desired,
        end
    ];

    const feasibility = await validateFeasibility(
        startPlace,
        desiredPlaces,
        availableTime,
        endPlace
    );

    const styles = {
        shortest: [],
        average: [],
        longest: []
    };

    const totals = {
        shortest: { time: 0, distance: 0 },
        average: { time: 0, distance: 0 },
        longest: { time: 0, distance: 0 }
    };

    const visited = {
        shortest: new Set(),
        average: new Set(),
        longest: new Set()
    };

    for (let i = 0; i < checkpoints.length - 1; i++) {

        const from = checkpoints[i];
        const to = checkpoints[i + 1];

        const segment = await buildThreeStyledSegmentPaths(
            from.id,
            to.id,
            visited
        );

        for (const style of ["shortest", "average", "longest"]) {

            const part = segment[style];

            if (!part || !part.path) continue;

            const cleanPath = sanitizePath(part.path);

            styles[style] = mergePaths(
                styles[style],
                cleanPath
            );

            totals[style].time += part.totalTime || 0;
            totals[style].distance += part.totalDistance || 0;

            for (const node of cleanPath) {
                visited[style].add(node.id);
            }
        }
    }

    return {
        feasible: feasibility.feasible,
        warning: feasibility.warning || null,
        suggestedPath: feasibility.suggestedPath || null,

        shortest: {
            path: styles.shortest.map(n => n.name),
            totalTime: totals.shortest.time.toFixed(2),
            totalDistance: totals.shortest.distance.toFixed(2),
            destinations: styles.shortest.length
        },

        average: {
            path: styles.average.map(n => n.name),
            totalTime: totals.average.time.toFixed(2),
            totalDistance: totals.average.distance.toFixed(2),
            destinations: styles.average.length
        },

        longest: {
            path: styles.longest.map(n => n.name),
            totalTime: totals.longest.time.toFixed(2),
            totalDistance: totals.longest.distance.toFixed(2),
            destinations: styles.longest.length
        }
    };
}

module.exports = {
    createTravelPlan,
    sanitizePath
};