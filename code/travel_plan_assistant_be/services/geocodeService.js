const axios = require("axios");

const GOOGLE_BASE_URL =
    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";

async function geocodePlace(place) {
    try {
        const response = await axios.get(GOOGLE_BASE_URL, {
            params: {
                input: place,
                inputtype: "textquery",
                fields: "place_id,name,geometry/location,rating,types",
                key: process.env.GOOGLE_API_KEY
            }
        });

        const candidates = response.data.candidates;

        if (!candidates || !candidates.length) {
            return null;
        }

        const result = candidates[0];

        return {
            place_id: result.place_id || null,
            name: result.name || place,
            lat: result.geometry?.location?.lat,
            lng: result.geometry?.location?.lng,
            rating: result.rating || null,
            types: result.types || []
        };

    } catch (error) {
        console.error(
            "Google geocode error:",
            error.response?.data || error.message
        );

        return null;
    }
}

module.exports = { geocodePlace };