const db = require("../config/db"); 

// Checks the destination already exist in DB before API call
async function findByName(place) {

    const [rows] = await db.execute(
        "SELECT destinationID, name, lat, lng FROM destinations WHERE name = ? LIMIT 1",
        [place]
    );

    if (!rows.length) return null;
    
    return {
        id: rows[0].destinationID,
        name: rows[0].name,
        lat: parseFloat(rows[0].lat),
        lng: parseFloat(rows[0].lng)
    };
}

/**
 * Returns destination data for the given ID
 */
async function findByID(id) {

    const [rows] = await db.execute(
        `SELECT destinationID, name, lat, lng
         FROM destinations
         WHERE destinationID = ?
         LIMIT 1`,
        [id]
    );

    if (!rows.length) return null;

    return {
        id: rows[0].destinationID,
        name: rows[0].name,
        lat: parseFloat(rows[0].lat),
        lng: parseFloat(rows[0].lng)
    };
}

/**
 * Get district tag for a district name
 */
async function getDistrictID(district_name) {
    const [rows] = await db.execute(
        "SELECT district_id FROM districts WHERE district_name = ? LIMIT 1",
        [district_name]
    );
    return rows.length ? rows[0].district_tag : null;
}

/**
 * Insert destination into the database
 */
async function insertDestination({district_id, name, lat, lng, rating = null}) {
    const [result] = await db.execute(
        `INSERT INTO destinations
        (district_id, name, lat, lng, rating, coords, created_at)
        VALUES (?, ?, ?, ?, ?, POINT(?, ?), NOW())`,
        [district_id, name, lat, lng, rating, lng, lat]
    );

    return result.insertId;
}

module.exports = { 
    findByName,
    findByID,
    getDistrictID,
    insertDestination
};