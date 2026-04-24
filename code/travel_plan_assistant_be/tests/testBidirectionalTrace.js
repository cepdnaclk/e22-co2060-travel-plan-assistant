require("dotenv").config();

const {
    buildSingleStylePath
} = require("../services/plannerService");

const {
    findByName
} = require("../services/destinationService");

async function resolveID(input) {

    if (!isNaN(input)) {
        return Number(input);
    }

    const place = await findByName(input);

    if (!place) {
        throw new Error(`Place not found: ${input}`);
    }

    return place.destinationID;
}

async function runTest() {

    console.log("\n===== CLEAN BIDIRECTIONAL TEST =====\n");

    const startInput = "Kandy";
    const endInput = "Ella";

    const startID = await resolveID(startInput);
    const endID = await resolveID(endInput);

    console.log("START:", startInput, "->", startID);
    console.log("END:", endInput, "->", endID);

    const result = await buildSingleStylePath(
        startID,
        endID,
        "shortest"
    );

    console.log("\n===== FINAL PATH =====\n");

    console.log(
        result.path.map(p => ({
            id: p.id,
            name: p.name
        }))
    );

    console.log("\n===== TRACE =====\n");

    for (const t of result.trace || []) {

        if (t.event === "MEET") {
            console.log("🎯 MEET NODE:", t.node);
            continue;
        }

        console.log(`Step ${t.step}`);
        console.log("Forward:", t.forwardAdded);
        console.log("Backward:", t.backwardAdded);
        console.log("----------------------");
    }
}

runTest().catch(console.error);