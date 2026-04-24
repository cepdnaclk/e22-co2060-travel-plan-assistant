const { buildSingleStylePath } = require("../services/plannerService");

async function runTest() {

    const result = await buildSingleStylePath(
        11, // Kandy
        13, // Galle
        "shortest",
        new Set()
    );

    console.log(JSON.stringify(result, null, 2));
}

runTest();