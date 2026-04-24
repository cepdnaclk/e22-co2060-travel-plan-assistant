require("dotenv").config();

const { geocodePlace } = require("../services/geocodeService");

const places = [
    "Peradeniya",
    "Sigiriya",
    "Ella Rock",
    "Galle Fort",
    "Arugam Bay",
    "Temple of the Tooth Kandy"
];

async function run() {
    console.log("\n===== GOOGLE GEOCODE TEST =====\n");

    for (const place of places) {
        try {
            const result = await geocodePlace(place);

            if (!result) {
                console.log(`✗ Not found: ${place}`);
                continue;
            }

            console.log(`✓ ${place}`);
            console.log({
                name: result.name,
                lat: result.lat,
                lng: result.lng,
                rating: result.rating,
                types: result.types
            });
            console.log("-----------------------------");

        } catch (err) {
            console.log(`✗ Error: ${place}`);
            console.log(err.message);
        }
    }
}

run();