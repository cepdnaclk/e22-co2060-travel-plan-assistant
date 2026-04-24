require("dotenv").config();

const { createTravelPlan } = require("../services/travelPlanner");

async function runTest() {

    console.log("\n===== TRAVEL PLAN TEST =====\n");

    const result = await createTravelPlan(
        "Kandy",
        ["Colombo"],
        1000,
        null
    );

    console.log("\n===== FEASIBILITY =====\n");
    console.log("Feasible:", result.feasible);
    console.log("Warning:", result.warning);

    console.log("\n===== SHORTEST PATH =====\n");
    console.log(result.shortest.path);
    console.log("Time:", result.shortest.totalTime);
    console.log("Distance:", result.shortest.totalDistance);

    console.log("\n===== AVERAGE PATH =====\n");
    console.log(result.average.path);
    console.log("Time:", result.average.totalTime);
    console.log("Distance:", result.average.totalDistance);

    console.log("\n===== LONGEST PATH =====\n");
    console.log(result.longest.path);
    console.log("Time:", result.longest.totalTime);
    console.log("Distance:", result.longest.totalDistance);

    console.log("\n===== STEP TRACE (if implemented) =====\n");

    if (result.trace) {
        result.trace.forEach((step, i) => {

            console.log(`Step ${i + 1}:`);
            console.log("From:", step.from);
            console.log("Chosen:", step.chosen);
            console.log("Reason:", step.reason);

            if (step.candidates) {
                console.log("Candidates count:", step.candidates.length);
            }

            console.log("----------------------");
        });
    }
}

runTest().catch(console.error);