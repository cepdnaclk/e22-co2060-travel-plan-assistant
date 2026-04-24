const { getSpatialCandidates,getCandidateRoutes } = require("../services/neighborService");
const { getNeighbors } = require("./neighbors");
const {
    filterDirectionalOnly
} = require("../services/directionalService");

async function findDirectionalCandidate(
    currentID,
    targetID,
    initialRadiusKm = 10,
    maxRadiusKm = 100,
    stepKm = 5
) {

    let radius = initialRadiusKm;

    const tested = new Set();

    while (radius <= maxRadiusKm) {

        const limit = radius;

        // console.log(`\n🔄 Radius: ${radius}km | Limit: ${limit}`);

        // STEP 1: spatial expansion
        const rawCandidates = await getSpatialCandidates(
            currentID,
            radius,
            limit
        );

        // console.log("Raw candidates found:", rawCandidates.length);

        // STEP 2: remove duplicates
        const freshCandidates = rawCandidates.filter(
            c => !tested.has(c.id)
        );

        freshCandidates.forEach(c => tested.add(c.id));

        // console.log("Fresh candidates:", freshCandidates.length);

        if (freshCandidates.length === 0) {
            radius += stepKm;
            continue;
        }

        // STEP 3: directional filter (geometry only)
        const directional = await filterDirectionalOnly(
            currentID,
            targetID,
            freshCandidates
        );

        // console.log("Directional candidates:", directional);

        if (!directional || directional.length === 0) {
            radius += stepKm;
            continue;
        }

        // 🔥 STEP 4: resolve real routes (CACHE + API FIX)
        const routes = await getCandidateRoutes(
            currentID,
            directional
        );

        // console.log("Resolved routes:", routes);

        if (routes.length > 0) {

            const best = routes[0];

            console.log(
                `✅ Direction found at ${radius}km -> ${best.id}`
            );

            return {
                id: best.id,
                distance: best.distance,
                duration: best.duration
            };
        }

        radius += stepKm;
    }

    console.log("❌ No directional candidate found");

    return null;
}

async function getTowardCandidatesWithFallback(
    currentID,
    targetID
) {

    console.log("\n===== TOWARD CANDIDATES START =====");

    // 1. normal neighbors (cheap cached graph)
    const neighbors = await getNeighbors(currentID);

    console.log("NEIGHBORS:", neighbors);

    // 2. direction filter
    let candidates = await filterTowardTarget(
        currentID,
        targetID,
        neighbors
    );

    console.log("FILTERED CANDIDATES:", candidates);

    // 3. if we already have valid ones → return
    if (candidates.length > 0) {

        console.log("✅ USING DIRECT CANDIDATES");

        return candidates;
    }

    // 4. fallback: expand spatially until we find direction match
    console.log("⚠️ FALLBACK TRIGGERED");

    const fallback = await findDirectionalCandidate(
        currentID,
        targetID
    );

    if (!fallback) {

        console.log("❌ NO VALID DIRECTION FOUND");

        return [];
    }

    console.log("🎯 FALLBACK NODE FOUND:", fallback);

    return [fallback];
}

module.exports = {
    findDirectionalCandidate,
    getTowardCandidatesWithFallback
};