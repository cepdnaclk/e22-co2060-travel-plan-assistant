const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GOOGLE_API_KEY;

async function getPlaceId(name, lat, lng) {
    try {
        const res = await axios.get(
            "https://maps.googleapis.com/maps/api/place/textsearch/json",
            {
                params: {
                    query: name,
                    location: `${lat},${lng}`,
                    radius: 5000,
                    key: process.env.GOOGLE_API_KEY
                }
            }
        );

        // 🔥 PRINT RAW RESPONSE
        console.log("\n========== RAW GOOGLE RESPONSE ==========\n");
        console.dir(res.data, { depth: null });
        console.log("\n=========================================\n");

        const results = res.data.results;

        if (!results || results.length === 0) {
            console.log("❌ No results found");
            return null;
        }

        console.log("✅ First result:", results[0]);

        return results[0].place_id;

    } catch (err) {
        console.log("❌ REQUEST FAILED:");
        console.log(err.response?.data || err.message);
        return null;
    }
}
async function getPlaceDetails(placeId) {
    const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
            params: {
                place_id: placeId,
                fields: "photos,reviews,editorial_summary,name",
                key: API_KEY
            }
        }
    );

    const result = res.data.result || {};

    return {
        name: result.name,
        description: result.editorial_summary?.overview || null,
        photos: (result.photos || [])
            .slice(0, 10)
            .map(p => p.photo_reference),
        reviews: (result.reviews || [])
            .slice(0, 5)
            .map(r => ({
                author: r.author_name,
                rating: r.rating,
                text: r.text
            }))
    };
}

async function testPlace() {
    const placeName = "Cheddikulam Tank"; // 👈 change this

    console.log("Searching place...");

    const placeId = await getPlaceId(placeName);

    if (!placeId) {
        console.log("No place found");
        return;
    }

    console.log("Place ID:", placeId);
}

testPlace();