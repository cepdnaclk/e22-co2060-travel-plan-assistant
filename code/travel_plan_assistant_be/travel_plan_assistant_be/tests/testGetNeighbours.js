const { getNeighbors } = require("../services/plannerService");
require("dotenv").config();

async function runTest() {

    try {

        console.log("TEST 1: Neighbors of destination ID 1");

        const result = await getNeighbors(7);

        console.log(result);

        console.log("\nTotal Neighbors:", result.length);

    } catch (err) {

        console.error("TEST FAILED:", err.message);
    }
}

runTest();