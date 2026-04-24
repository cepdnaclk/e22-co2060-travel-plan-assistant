require("dotenv").config();

const { createTravelPlan } = require("../services/travelPlanner");

async function runTest() {

    console.log("\n===== TRAVEL PLANNER BASIC TEST =====\n");

    const result = await createTravelPlan(
        "Colombo",
        ["Kandy"],
        1000,
        "Ella"
    );

    console.log("\n===== RESULT =====\n");

    console.log("PATH:", result.path);

    console.log("\nMETRICS:");
    console.log("Time:", result.totalTime);
    console.log("Distance:", result.totalDistance);

    console.log("\nCHECKPOINTS:");
    console.log(result.checkpoints);

    console.log("\nTRACE:");
    console.log(result.trace || "No trace");
}

runTest().catch(console.error);