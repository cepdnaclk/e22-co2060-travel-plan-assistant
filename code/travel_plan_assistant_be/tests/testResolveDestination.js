require("dotenv").config();

const { resolveDestination } = require("../services/distanceService");

async function runTest() {
    const places = ["Colombo", "Kandy", "Ella", "Galle"];

    for (const place of places) {
        try {
            const result = await resolveDestination(place);

            console.log("\n======================");
            console.log("INPUT:", place);
            console.log(result);

        } catch (err) {
            console.log(`FAILED: ${place}`);
            console.log(err.message);
        }
    }
}

runTest();