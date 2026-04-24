const { findByID } = require("./destinationService");
const { isInDirectionBox } = require("../helpers/utils");
const { getDistance } = require("../helpers/utils");

/**
 * Filters neighbors that move closer toward target destination.
 * Uses haversine distance heuristic.
 */
async function filterTowardTarget(currentID, targetID, neighbors) {

    const current = await findByID(currentID);
    const target = await findByID(targetID);

    if (!current || !target) return neighbors;

    const currentDist = getDistance(
        current.lat,
        current.lng,
        target.lat,
        target.lng
    );

    const MAX_KM = 25;

    const filtered = [];

    for (const node of neighbors) {

        const place = await findByID(node.id);
        if (!place) continue;

        // ❌ hard radius cut
        if (node.distance > MAX_KM) continue;

        const nextDist = getDistance(
            place.lat,
            place.lng,
            target.lat,
            target.lng
        );

        // console.log({
        //     from: current.id,
        //     to: target.id,
        //     node: node.id,
        //     distNow: currentDist,
        //     distNext: nextDist,
        //     improvement: currentDist - nextDist
        // });

        // must improve distance
        if (nextDist >= currentDist) continue;

        // must be directionally aligned
        if (!isInDirectionBox(current, place, target)) continue;

        filtered.push(node);
    }

    return filtered;
}

async function filterDirectionalOnly(currentID, targetID, neighbors) {

    const current = await findByID(currentID);
    const target = await findByID(targetID);

    if (!current || !target) return [];

    const filtered = [];

    for (const node of neighbors) {

        const place = await findByID(node.id);

        if (!place) continue;

        if (isInDirectionBox(current, place, target)) {
            filtered.push(node);
        }
    }

    return filtered;
}

module.exports = {
    filterTowardTarget,
    filterDirectionalOnly
};