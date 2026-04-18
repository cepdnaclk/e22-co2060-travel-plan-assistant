const {
    getNeighbors,
    filterTowardTarget
} = require("../services/plannerService");

async function runTest() {

    const currentID = 8;
    const targetID = 14;

    const neighbors = await getNeighbors(currentID);

    console.log("ALL:");
    console.log(neighbors);

    const filtered = await filterTowardTarget(
        currentID,
        targetID,
        neighbors
    );

    console.log("\nTOWARD TARGET:");
    console.log(filtered);
}

runTest();