const axios = require("axios");
const ORS_BASE_URL = "https://api.openrouteservice.org";

async function geocodePlace(place) {
    try {
        const response = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
            params: { text: place, boundary_country: "LK", size: 1 },
            headers: { Authorization: process.env.ORS_API_KEY }
        });

        if (!response.data.features.length) return null;

        const [lng, lat] = response.data.features[0].geometry.coordinates;

        return { lat, lng };
    
    } catch (error) {
        console.error("ORS geocode error:", error.message);
        return null;
    }

}

module.exports = { geocodePlace };