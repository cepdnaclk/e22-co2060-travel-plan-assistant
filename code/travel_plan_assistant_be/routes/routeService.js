const express = require("express");
const axios = require("axios");
const router = express.Router();

const ORS_BASE_URL = "https://api.openrouteservice.org";

// Helper function to geocode place name
async function getCoordinates(place) {
    const response = await axios.get(
        `${ORS_BASE_URL}/geocode/search`,
        {
            params: {
                text: place,
                boundary_country: "LK", 
                size: 1
            },
            headers: {
                Authorization: process.env.ORS_API_KEY
            }
        }
    );

    if (!response.data.features.length) {
        throw new Error(`No location found for ${place}`);
    }

    return response.data.features[0].geometry.coordinates;
}

// Main route
router.post("/distance-by-name", async (req, res) => {
    const { start, end } = req.body;

    try {
        const startCoords = await getCoordinates(start);
        const endCoords = await getCoordinates(end);

        const routeResponse = await axios.post(
            `${ORS_BASE_URL}/v2/directions/driving-car`,
            {
                coordinates: [startCoords, endCoords]
            },
            {
                headers: {
                    Authorization: process.env.ORS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const summary = routeResponse.data.routes[0].summary;

        res.json({
            start,
            end,
            distance_km: (summary.distance / 1000).toFixed(2),
            duration_min: (summary.duration / 60).toFixed(2)
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to calculate route",
            details: error.message
        });
    }
});

module.exports = router;
