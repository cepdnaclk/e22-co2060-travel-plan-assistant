require("dotenv").config();

const {
    expandFrontier
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

    console.log("\n===== EXPAND FRONTIER TEST =====\n");

    const start = "Kandy";
    const target = "Colombo";

    const startID = await resolveID(start);
    const targetID = await resolveID(target);

    const visited = new Set([startID]);

    console.log("START :", start, "->", startID);
    console.log("TARGET:", target, "->", targetID);

    const result = await expandFrontier(
        new Set([startID]),
        targetID,
        visited
    );

    console.log("\n===== RESULT =====\n");

    console.log("Next Frontier:");
    console.log([...result.frontier]);

    console.log("\nAdded Nodes:");

    console.table(
        result.added.map(n => ({
            id: n.id,
            name: n.name,
            lat: n.lat,
            lng: n.lng
        }))
    );
}

runTest().catch(console.error);