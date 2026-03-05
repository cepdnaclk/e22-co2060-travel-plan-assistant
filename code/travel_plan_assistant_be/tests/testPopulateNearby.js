require("dotenv").config();
const db = require("../config/db");
const { populateNearby } = require("../helpers/nearby");


(async () => {
    try {
        const destinationID = "KAN006"; // Akbar Bridge ID
        const lat = 7.25459200;
        const lng = 80.59515600;

        console.log("Populating nearby destinations...");
        await populateNearby(destinationID, lat, lng);

        // Check nearby_destinations table
        const [nearbyRows] = await db.execute(
            "SELECT * FROM nearby_destinations WHERE nearbyID LIKE ?",
            [`${destinationID}-%`]
        );

        console.log("Nearby entries in nearby_destinations table:");
        console.table(nearbyRows);

        // Check updated 'nearby' column in destinations table
        const [destRows] = await db.execute(
            "SELECT name, nearby FROM destinations WHERE destinationID = ?",
            [destinationID]
        );

        console.log("Updated 'nearby' column in destinations table:");
        console.table(destRows);

    } catch (err) {
        console.error("Test failed:", err.message);
    } finally {
        await db.end(); // close DB connection
    }
})();