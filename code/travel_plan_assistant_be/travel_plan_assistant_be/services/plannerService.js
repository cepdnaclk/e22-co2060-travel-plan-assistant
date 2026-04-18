const db = require("../config/db");
const { findByID } = require("./destinationService");
const { getDistance } = require("../helpers/utils")

// Get the neighbours of a destination
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

// Choose the neighbour for shortest, average and longest
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

// Condition for filtering destinations so the target is reached faster
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

module.exports = {
    getNeighbors,
    chooseNeighborByStyle,
    filterTowardTarget
};