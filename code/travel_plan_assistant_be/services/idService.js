const db = require("../config/db");

/**
 * Get the next destination number for a given district tag
 * @param {string} districtTag e.g. "KAN"
 * @returns {Promise<number>} next number
 */
async function getNextDestinationNumber(districtTag) {
    const [rows] = await db.execute(
        `SELECT destinationID FROM destinations WHERE district_tag = ?`,
        [districtTag]
    );

    if (rows.length === 0) return 1;

    // Extract numeric parts
    const numbers = rows.map(r => {
        const match = r.destinationID.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
    });

    const maxNumber = Math.max(...numbers);

    return maxNumber + 1;
}

/**
 * Format destinationID as TAG + padded number
 * e.g. KAN + 5 -> KAN005
 */
function formatDestinationID(districtTag, number, padding = 3) {
    return `${districtTag}${String(number).padStart(padding, "0")}`;
}

function formatNearbyID(id1, id2) {
    return [id1, id2].sort().join("-");
}

module.exports = { 
    getNextDestinationNumber, 
    formatDestinationID,
    formatNearbyID
 };