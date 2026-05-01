const axios = require("axios");
require("dotenv").config();
const pool = require("../config/db");

const API_KEY = process.env.GOOGLE_API_KEY;

// 🔥 CONTROL YOUR BATCH HERE
const START_ID = 301;
const END_ID = 434;

async function getPlaceDetails(placeId) {
    try {
        const res = await axios.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            {
                params: {
                    place_id: placeId,
                    fields: "photos,reviews,editorial_summary",
                    key: API_KEY
                }
            }
        );

        const result = res.data.result || {};

        return {
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

    } catch (err) {
        console.error("Details fetch error:", err.response?.data || err.message);
        return null;
    }
}

async function enrichPlaces() {
    const [rows] = await pool.execute(
        `SELECT destinationID, place_id 
         FROM destinations 
         WHERE place_id IS NOT NULL
         AND (description IS NULL OR photos IS NULL OR user_reviews IS NULL)
         AND destinationID BETWEEN ? AND ?`,
        [START_ID, END_ID]
    );

    console.log(`Found ${rows.length} places to enrich`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
        const { destinationID, place_id } = rows[i];

        console.log(`Processing ${i + 1}/${rows.length} (ID: ${destinationID})`);

        const data = await getPlaceDetails(place_id);

        if (!data) {
            console.log(`❌ Failed to fetch for ${destinationID}`);
            failed++;
            continue;
        }

        await pool.execute(
            `UPDATE destinations
             SET description = ?, photos = ?, user_reviews = ?
             WHERE destinationID = ?`,
            [
                data.description,
                JSON.stringify(data.photos),
                JSON.stringify(data.reviews),
                destinationID
            ]
        );

        console.log(`✔ Updated ID ${destinationID}`);
        success++;

        // 🔥 rate limit protection
        await new Promise(res => setTimeout(res, 200));
    }

    console.log("\n===== ENRICHMENT COMPLETE =====");
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
}

enrichPlaces();