const axios = require("axios");
const ORS_BASE_URL = "https://api.openrouteservice.org";

/**
 * Get driving distance and duration between two coordinates
 * @param {number} startLat
 * @param {number} startLng
 * @param {number} endLat
 * @param {number} endLng
 * @returns {Promise<{distance: number, duration: number}>} - Distance in km, duration in minutes
 */

async function getDistanceAndDuration(startLat, startLng, endLat, endLng) {
    try {
        const response = await axios.post(
            `${ORS_BASE_URL}/v2/directions/driving-car`,
            {
                coordinates: [
                    [startLng, startLat],
                    [endLng, endLat]
                ]
            },
            {
                headers: {
                    Authorization: process.env.ORS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        if (
            !response.data ||
            !response.data.features ||
            !response.data.features.length
        )
        {
            console.warn("ORS did not return");
            return null;
        }

        const summary = response.data.features[0].properties.summary;

        return{
            distance: +(summary.distance/1000).toFixed(2),
            duration: +(summary.duration/60).toFixed(2) 
        };

    } catch (err) {
        console.error("ORS error:", err.message);
        return null;
    }
}

module.exports = {
    getDistanceAndDuration
};