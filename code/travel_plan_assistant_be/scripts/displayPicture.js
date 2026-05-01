require("dotenv").config();
const pool = require("../config/db");
const { downloadPlacePhoto } = require("../services/destinationService");

// CONFIG
const START_ID = 301;
const END_ID = 434;
const DELAY_MS = 300;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBatch() {
    try {
        const [rows] = await pool.execute(
            `SELECT destinationID, place_id, photos
             FROM destinations
             WHERE destinationID BETWEEN ? AND ?
             AND display_picture IS NULL
             AND photos IS NOT NULL`,
            [START_ID, END_ID]
        );

        console.log(`📦 Processing ${rows.length} destinations (ID ${START_ID} → ${END_ID})`);

        if (!rows.length) {
            console.log("✅ No records found in this range");
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            const d = rows[i];

            console.log(`\n🔄 ${i + 1}/${rows.length} → ID: ${d.destinationID}`);

            // Parse photos safely
            let photos = [];

            if (Array.isArray(d.photos)) {
                photos = d.photos;
            } else {
                try {
                    photos = JSON.parse(d.photos);
                } catch {
                    console.log("⚠️ Invalid JSON, skipping");
                    continue;
                }
            }

            if (!photos.length) {
                console.log("⚠️ No photos found");
                continue;
            }

            const firstRef = photos[0];
            const fileName = `${d.place_id || d.destinationID}.jpg`;

            // Download image
            const result = await downloadPlacePhoto(firstRef, fileName);

            if (!result) {
                console.log("❌ Download failed");
                continue;
            }

            // Update DB
            await pool.execute(
                `UPDATE destinations
                 SET display_picture = ?
                 WHERE destinationID = ?`,
                [fileName, d.destinationID]
            );

            console.log(`✅ Saved: ${fileName}`);

            await sleep(DELAY_MS);
        }

        console.log("\n🎉 Batch complete");

    } catch (err) {
        console.error("❌ Batch error:", err.message);
    }
}

runBatch();