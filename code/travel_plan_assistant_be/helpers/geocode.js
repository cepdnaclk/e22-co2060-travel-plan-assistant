const axios = require("axios");
const db = require("../config/db"); // your MySQL connection
const ORS_BASE_URL = "https://api.openrouteservice.org";

/**
 * Get coordinates for a place
 * 1. Check the database first
 * 2. If not found, call ORS
 * @param {string} place
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function getCoordinates(place) {
    try {
        //  Check DB first
        const [rows] = await db.execute(
            "SELECT lat, lng FROM destinations WHERE name = ? LIMIT 1",
            [place]
        );
        if (rows.length > 0) {
            return { lat: rows[0].lat, lng: rows[0].lng };
        }

        // Call ORS if not in DB
        const response = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
            params: {
                text: place,
                boundary_country: "LK",
                size: 1
            },
            headers: {
                Authorization: process.env.ORS_API_KEY
            }
        });

        if (!response.data.features.length) {
            throw new Error("Location not found in ORS");
        }

        const [lng, lat] = response.data.features[0].geometry.coordinates;

        return { lat, lng };
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Geocode failed");
    }
}

/**
 * Save a new destination to the destinations table
 * @param {Object} dest - { destinationID, district_code, district_name, name, lat, lng, rating }
 */
async function saveDestination(dest) {
    const {
        destinationID,
        district_code,
        district_name,
        name,
        lat,
        lng,
        rating = null
    } = dest;

    await db.execute(
        `INSERT INTO destinations 
         (destinationID, district_code, district_name, name, lat, lng, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [destinationID, district_code, district_name, name, lat, lng, rating]
    );
}

module.exports = {
    getCoordinates,
    saveDestination
};