const pool = require("../config/db");

const TEST_DESTINATION_ID = 1;

async function testStoredDestination() {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM destinations WHERE destinationID = ?",
            [TEST_DESTINATION_ID]
        );

        if (!rows.length) {
            console.log("❌ No destination found");
            return;
        }

        const d = rows[0];

        let photos = [];
        let reviews = [];


        // 🔥 FIX: handle both string + already-parsed JSON
        if (d.photos) {
            if (typeof d.photos === "string") {
                try {
                    photos = JSON.parse(d.photos);
                } catch {
                    console.log("⚠️ Failed to parse photos JSON");
                }
            } else {
                photos = d.photos; // already parsed
            }
        }

        if (d.user_reviews) {
            if (typeof d.user_reviews === "string") {
                try {
                    reviews = JSON.parse(d.user_reviews);
                } catch {
                    console.log("⚠️ Failed to parse reviews JSON");
                }
            } else {
                reviews = d.user_reviews; // already parsed
            }
        }

        console.log("\n===== DESTINATION DATA =====\n");

        console.log("ID:", d.destinationID);
        console.log("Name:", d.name);
        console.log("Place ID:", d.place_id);

        console.log("\n--- RAW PHOTO REFS ARRAY ---");
        console.dir(photos, { depth: null });

        console.log("\n--- INDIVIDUAL PHOTO REFS ---");
        photos.forEach((ref, i) => {
            console.log(`${i + 1}: ${ref}`);
        });

        // 🔥 OPTIONAL: show actual usable image URLs
        console.log("\n--- GENERATED PHOTO URLs ---");
        photos.forEach((ref, i) => {
            const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${process.env.GOOGLE_API_KEY}`;
            console.log(`${i + 1}: ${url}`);
        });

        console.log("\n--- REVIEWS ---");
        reviews.forEach((r, i) => {
            console.log(`\n[${i + 1}]`);
            console.log("Author:", r.author);
            console.log("Rating:", r.rating);
            console.log("Text:", r.text);
        });

        console.log("\n============================\n");

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

testStoredDestination();