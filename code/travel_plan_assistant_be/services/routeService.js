const axios = require("axios");

const GOOGLE_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

const { safeApiCall } = require("../helpers/safeApi");
const { findByID } = require("../services/destinationService");

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

        const response = await safeApiCall(() =>
            axios.post(
                GOOGLE_URL,
                {
                    origin: {
                        location: {
                            latLng: {
                                latitude: startLat,
                                longitude: startLng
                            }
                        }
                    },
                    destination: {
                        location: {
                            latLng: {
                                latitude: endLat,
                                longitude: endLng
                            }
                        }
                    },
                    travelMode: "DRIVE",
                    routingPreference: "TRAFFIC_UNAWARE"
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
                        "X-Goog-FieldMask":
                            "routes.distanceMeters,routes.duration"
                    }
                }
            )
        );

        if (!response) {
            console.log("NO RESPONSE RETURNED");
            return null;
        }
        
        const routes = response.data.routes;

        if (!routes || !routes.length) return null;

        const route = routes[0];

        return {
            distance: +(route.distanceMeters / 1000).toFixed(2),
            duration: +(parseFloat(route.duration) / 60).toFixed(2)
        };

    } catch (err) {
        console.error("Route error:", err.response?.data || err.message);
        return null;
    }
}

async function getDistanceAndDurationByID(startID, endID) {

    const start = await findByID(startID);
    const end = await findByID(endID);

    if (!start || !end) return null;

    return await getDistanceAndDuration(
        parseFloat(start.lat),
        parseFloat(start.lng),
        parseFloat(end.lat),
        parseFloat(end.lng)
    );
}


module.exports = {
    getDistanceAndDuration,
    getDistanceAndDurationByID
}