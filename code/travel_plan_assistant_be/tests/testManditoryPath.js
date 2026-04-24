// tests/testMandatoryPath.js
require("dotenv").config();

const { createTravelPlan } = require("../services/travelPlanner");

async function runTest() {

    const result = await createTravelPlan(
        "Colombo",
        ["Kandy", "Ella"],
        0,
        "Galle"
    );

    console.log("\n===== MANDATORY PATH TEST =====");
    console.log(result);
}

runTest();