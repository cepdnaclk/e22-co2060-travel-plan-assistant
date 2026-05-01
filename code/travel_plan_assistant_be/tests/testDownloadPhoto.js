require("dotenv").config();
const pool = require("../config/db");
const { downloadPlacePhoto } = require("../services/destinationService");

const TEST_DESTINATION_ID = 1;

async function testDownloadDisplayPicture() {
    try {
        // 1. Get destination from DB
        const [rows] = await pool.execute(
            "SELECT destinationID, place_id, photos FROM destinations WHERE destinationID = ?",
            [TEST_DESTINATION_ID]
        );

        if (!rows.length) {
            console.log("❌ Destination not found");
            return;
        }

        const d = rows[0];

        // 2. Parse photos safely
        let photos = [];

        if (Array.isArray(d.photos)) {
            photos = d.photos;
        } else if (typeof d.photos === "string") {
            try {
                photos = JSON.parse(d.photos);
            } catch (err) {
                console.log("❌ Invalid JSON in photos column");
                console.log(d.photos);
                return;
            }
        }

        if (!photos.length) {
            console.log("❌ No photos available");
            return;
        }

        // 3. Take first photo reference
        const firstPhotoRef = photos[0];

        console.log("📸 First photo ref:", firstPhotoRef);

        // 4. Generate file name
        const fileName = `${d.place_id || d.destinationID}.jpg`;

        console.log("⬇️ Downloading image...");

        const savedPath = await downloadPlacePhoto(firstPhotoRef, fileName);

        if (!savedPath) {
            console.log("❌ Download failed");
            return;
        }

        console.log("✅ Image saved at:", savedPath);

        // 5. Save filename to DB (display_picture column)
        await pool.execute(
            "UPDATE destinations SET display_picture = ? WHERE destinationID = ?",
            [fileName, TEST_DESTINATION_ID]
        );

        console.log("💾 display_picture updated in DB:", fileName);

    } catch (err) {
        console.error("❌ Test failed:", err.message);
    }
}

testDownloadDisplayPicture();