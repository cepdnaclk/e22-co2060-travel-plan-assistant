// testPeradeniya.js
require("dotenv").config();
const { getCoordinates, saveDestination } = require("./helpers/geocode");
const { getClosestDistrict } = require("./helpers/district");
const { getNearbyDestinations } = require("./helpers/nearby");
const db = require("./config/db"); 

async function testPeradeniya() {
    try {
        const placeName = "Mirissa Beach"; // example name

        // Get coordinates (DB or ORS)
        const coords = await getCoordinates(placeName);
        if (!coords) {
            console.error("No valid coordinates found for", placeName);
            return;
        }
        const { lat, lng } = coords;
        console.log("Coordinates:", lat, lng);

        // Get closest district
        const district = await getClosestDistrict(lat, lng);
        console.log("Closest District:", district);

        // Check nearby destinations
        const nearby = await getNearbyDestinations(lat, lng,5, 0.1);
        console.log("Nearby destinations:", nearby);

        // Generate unique destinationID based on district tag
        let baseID = district.district_tag.toUpperCase();
        let nextNum = 1;

        // Find the max number for this district in DB
        const [rows] = await db.execute(
            "SELECT destinationID FROM destinations WHERE destinationID LIKE ?",
            [`${baseID}%`]
        );

        if (rows.length > 0) {
            // extract the numeric part and find the max
            const numbers = rows.map(r => {
                const match = r.destinationID.match(/\d+$/);
                return match ? parseInt(match[0], 10) : 0;
            });
            nextNum = Math.max(...numbers) + 1;
        }

        // Format destinationID with 3 digits
        const destinationID = `${baseID}${String(nextNum).padStart(3, "0")}`;
        console.log("Generated destinationID:", destinationID);

        // 5️⃣ Save destination
        await saveDestination({
            destinationID,
            district_name: district.district_name,
            district_tag: district.district_tag,
            name: placeName,
            lat,
            lng,
            rating: null
        });

        console.log("Destination saved successfully!");
    } catch (err) {
        console.error(err);
    }
}

testPeradeniya();