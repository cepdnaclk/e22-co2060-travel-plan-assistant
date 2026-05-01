const axios = require("axios");
require("dotenv").config();
const pool = require("../config/db");

const API_KEY = process.env.GOOGLE_API_KEY;

// Batch
const START_ID = 301;
const END_ID = 434;

async function getPlaceId(name, lat, lng) {
    const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        {
            params: {
                query: name,
                location: `${lat},${lng}`,
                radius: 5000,
                key: API_KEY
            }
        }
    );

    const results = res.data.results;

    if (!results || results.length === 0) {
        return null;
    }

    return results[0].place_id;
}

async function updatePlaceIds() {
    const [rows] = await pool.execute(
        `SELECT destinationID, name, lat, lng 
         FROM destinations 
         WHERE place_id IS NULL 
         AND destinationID BETWEEN ? AND ?`,
        [START_ID, END_ID]
    );

    console.log(`Found ${rows.length} places in batch ${START_ID} - ${END_ID}`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
        const { destinationID, name, lat, lng } = rows[i];

        console.log(`Processing ${i + 1}/${rows.length}: ${name}`);

        const placeId = await getPlaceId(name, lat, lng);

        if (!placeId) {
            console.log(`❌ No match found for ${name}`);
            failed++;
            continue;
        }

        await pool.execute(
            "UPDATE destinations SET place_id = ? WHERE destinationID = ?",
            [placeId, destinationID]
        );

        console.log(`✔ Updated: ${name}`);
        success++;

        // rate limiting (important for Google)
        await new Promise(res => setTimeout(res, 200));
    }

    console.log("\n===== BATCH COMPLETE =====");
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
}

updatePlaceIds();