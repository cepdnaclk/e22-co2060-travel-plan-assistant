const db = require("../config/db"); 

// Checks the destination already exist in DB before API call
async function findByName(place) {

    const [rows] = await db.execute(
        "SELECT lat, lng FROM destinations WHERE name = ? LIMIT 1",
        [place]
    );

    if (!rows.length) return null;
    
    return {
        lat: parseFloat(rows[0].lat),
        lng: parseFloat(rows[0].lng)
    };
}

/**
 * Get district tag for a district name
 */
async function getDistrictTag(district_name) {
    const [rows] = await db.execute(
        "SELECT district_tag FROM districts WHERE district_name = ? LIMIT 1",
        [district_name]
    );
    return rows.length ? rows[0].district_tag : null;
}

/**
 * Insert destination into the database
 */
async function insertDestination({destinationID, district_name, district_tag, name, lat, lng, rating = null}) {
    await db.execute(
        `INSERT INTO destinations
        (destinationID, district_name, district_tag, name, lat, lng, rating, coords, created_at, nearby)
        VALUES (?, ?, ?, ?, ?, ?, ?, POINT(?, ?), NOW(), '')`,
        [destinationID, district_name, district_tag, name, lat, lng, rating, lng, lat]
    );
}

module.exports = { 
    findByName,
    getDistrictTag,
    insertDestination
};