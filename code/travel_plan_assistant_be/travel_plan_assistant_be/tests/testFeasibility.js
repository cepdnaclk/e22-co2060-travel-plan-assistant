const { validateFeasibility } = require("../services/distanceService");
require("dotenv").config();

async function runTests() {

    console.log("TEST 1: Feasible");

    console.log(
        await validateFeasibility(
            "Colombo",
            ["Kandy", "Ella"],
            1000
        )
    );

    console.log("\nTEST 2: Tolerance Window");

    console.log(
        await validateFeasibility(
            "Colombo",
            ["Kandy", "Ella"],
            300
        )
    );

    console.log("\nTEST 3: Hard Fail");

    console.log(
        await validateFeasibility(
            "Colombo",
            ["Kandy", "Ella"],
            150
        )
    );

    console.log("\nTEST 4: End Location");

    console.log(
        await validateFeasibility(
            "Colombo",
            ["Kandy"],
            1000,
            "Galle"
        )
    );
}

runTests();