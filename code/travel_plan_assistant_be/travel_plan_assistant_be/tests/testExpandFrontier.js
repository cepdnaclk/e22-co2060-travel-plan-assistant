const { expandFrontier } = require("../services/plannerService");

async function runTest() {

    const frontier = new Set([7]); // Kandy
    const targetID = 14; // Galle
    const style = "shortest";

    const result = await expandFrontier(
        frontier,
        targetID,
        style,
        new Set()
    );

    console.log("Expanded:");
    console.log(result);
}

runTest();