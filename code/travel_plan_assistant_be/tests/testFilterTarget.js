require("dotenv").config();

const {
    getTowardCandidatesWithFallback
} = require("../services/plannerService");

const {
    findByName
} = require("../services/destinationService");

async function resolveID(input) {

    if (!isNaN(input)) return Number(input);

    const place = await findByName(input);

    if (!place) {
        throw new Error(`Place not found: ${input}`);
    }

    return place.id;
}

async function runTest() {

    console.log("\n===== TOWARD CANDIDATE TEST =====\n");

    const currentInput = "Kandy";
    const targetInput = "Colombo";

    const currentID = await resolveID(currentInput);
    const targetID = await resolveID(targetInput);

    console.log("CURRENT:", currentInput, "->", currentID);
    console.log("TARGET :", targetInput, "->", targetID);

    const result = await getTowardCandidatesWithFallback(
        currentID,
        targetID
    );

    console.log("\n===== RESULT =====\n");

    console.table(result);

    console.log("\nTotal candidates:", result.length);
}

runTest().catch(console.error);