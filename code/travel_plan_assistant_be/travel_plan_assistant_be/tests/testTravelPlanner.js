require("dotenv").config();

const { createTravelPlan } = require("../services/travelPlanner");

async function runTest() {

    const result = await createTravelPlan(
        "Colombo",
        ["Kandy", "Ella"],
        1500,
        "Galle"
    );

    console.log(JSON.stringify(result, null, 4));
}

runTest();