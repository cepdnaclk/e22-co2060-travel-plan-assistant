require("dotenv").config();

const { expandFrontier } = require("../services/plannerService");
const { findByName } = require("../services/destinationService");

async function resolveID(input) {

    if (!isNaN(input)) return Number(input);

    const place = await findByName(input);

    if (!place) {
        throw new Error(`Place not found: ${input}`);
    }

    return place.id;
}

async function runTest() {

    console.log("\n===== FULL FRONTIER EXPANSION TEST =====\n");

    const start = "Kandy";
    const target = "Colombo";

    const startID = await resolveID(start);
    const targetID = await resolveID(target);

    console.log("START :", start, "->", startID);
    console.log("TARGET:", target, "->", targetID);

    let frontier = new Set([startID]);
    const visited = new Set([startID]);

    const maxSteps = 50;
    let step = 0;

    while (frontier.size > 0 && step < maxSteps) {

        step++;

        console.log(`\n========== STEP ${step} ==========`);
        console.log("Frontier:", [...frontier]);

        const result = await expandFrontier(
            frontier,
            targetID,
            visited
        );

        console.log("\nAdded Nodes:");
        console.table(
            result.added.map(n => ({
                id: n.id,
                name: n.name,
                lat: n.lat,
                lng: n.lng
            }))
        );

        // check if target reached
        const found = result.added.find(n => n.id === targetID);

        if (found) {
            console.log("\n🎯 TARGET REACHED!");
            break;
        }

        frontier = result.frontier;

        if (!frontier || frontier.size === 0) {
            console.log("\n❌ Frontier exhausted");
            break;
        }
    }

    console.log("\n===== END OF SEARCH =====");
}

runTest().catch(console.error);