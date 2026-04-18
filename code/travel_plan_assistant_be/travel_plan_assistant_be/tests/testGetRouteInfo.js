const { getRouteInfo } = require("../services/distanceService");
require('dotenv').config();

async function runTest() {

    try {
        console.log("TEST 1: First call (should hit ORS)");

        const result1 = await getRouteInfo("Colombo", "Kandy");
        console.log(result1);


        console.log("\nTEST 2: Second call (should use cache)");

        const result2 = await getRouteInfo("Colombo", "Kandy");
        console.log(result2);


        console.log("\nTEST 3: Reverse direction (should STILL use cache)");

        const result3 = await getRouteInfo("Kandy", "Colombo");
        console.log(result3);

        console.log("\nTEST 4: Already in DB");

        const result4 = await getRouteInfo("Peradeniya", "Akbar Bridge");
        console.log(result4);


    } catch (err) {
        console.error("TEST ERROR:", err.message);
    }
}

runTest();