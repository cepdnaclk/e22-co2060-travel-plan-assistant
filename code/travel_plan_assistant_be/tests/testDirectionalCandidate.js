require("dotenv").config();

const {
    getNeighbors
} = require("../helpers/neighbors");

const {
    filterTowardTarget
} = require("../services/directionalService");

const {
    findDirectionalCandidate
} = require("../helpers/directional");

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

    console.log("\n===== DIRECTIONAL CANDIDATE TEST =====\n");

    const current = "Royal Botanic Gardens, Peradeniya";
    const target = "Colombo";

    const currentID = await resolveID(current);
    const targetID = await resolveID(target);

    console.log("CURRENT:", current, "->", currentID);
    console.log("TARGET :", target, "->", targetID);

    // STEP 1: normal neighbors
    const neighbors = await getNeighbors(currentID);

    console.log("\n===== NEIGHBORS =====");
    console.table(neighbors);

    // STEP 2: directional filtering
    const filtered = await filterTowardTarget(
        currentID,
        targetID,
        neighbors
    );

    console.log("\n===== FILTERED TOWARD TARGET =====");
    console.table(filtered);

    // STEP 3: fallback search if empty
    if (!filtered || filtered.length === 0) {

        console.log("\n⚠️ No directional candidates → running fallback");

        const fallback = await findDirectionalCandidate(
            currentID,
            targetID
        );

        console.log("\n===== FALLBACK RESULT =====");

        if (fallback) {
            console.table([fallback]);
        } else {
            console.log(null);
        }
    }
}

runTest().catch(console.error);