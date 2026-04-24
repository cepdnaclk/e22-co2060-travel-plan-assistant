require("dotenv").config();

const { getNearbyDestinations } = require("../helpers/nearby");
const { resolveDestination } = require("../services/distanceService");

async function runTest() {

    const city = "Ella";

    const row = await resolveDestination(city);

    const result = await getNearbyDestinations(
        row.lat,
        row.lng,
        25,
        1,
        10
    );

    console.log(`\n===== NEARBY FOR ${city} =====`);
    console.log(result);
}

runTest();