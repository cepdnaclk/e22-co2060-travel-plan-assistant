const axios = require("axios");
const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
const { safeORSCall } = require("../helpers/safeORS");

/**
 * Get driving distance and duration between two coordinates
 * @param {number} startLat
 * @param {number} startLng
 * @param {number} endLat
 * @param {number} endLng
 * @returns {Promise<{distance: number, duration: number} | null>}
 */
async function getDistanceAndDuration(startLat, startLng, endLat, endLng) {
    try {
        
        const response = await axios.post(
            `${ORS_BASE_URL}`,
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

        const routes = response.data.routes;
        if (!routes || !routes.length) {
            console.warn("ORS did not return any routes:", response.data);
            return null;
        }

        const summary = routes[0].summary;
        if (!summary) {
            console.warn("ORS route missing summary:", routes[0]);
            return null;
        }

        return {
            distance: +(summary.distance / 1000).toFixed(2), // km
            duration: +(summary.duration / 60).toFixed(2)    // min
        };

    } catch (err) {
        if (err.response) {
            console.error(
                "ORS API error:",
                err.response.status,
                err.response.data
            );
        } else {
            console.error("ORS request failed:", err.message);
        }
        return null;
    }
}

module.exports = { getDistanceAndDuration };