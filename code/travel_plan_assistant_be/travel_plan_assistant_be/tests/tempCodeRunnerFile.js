const { getDestinationWithinRadius } = require("../services/nearbyService");

async function test() {
    try {
        const lat = 7.25459200;   // Akbar Birdge
        const lng = 80.59515600;


        const rows = await getDestinationWithinRadius(lat, lng);

        console.log("Destinations found:", rows.length);
        console.log(rows);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();