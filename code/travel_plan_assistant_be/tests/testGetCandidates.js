require("dotenv").config();

const {
    getSpatialCandidates
} = require("../services/neighborService");

const { findByID } = require("../services/destinationService");
const { isInDirectionBox } = require("../helpers/utils");
const {
    findByName
} = require("../services/destinationService");


async function runTest() {

    try {

        console.log("\n===== SPATIAL + FILTER TEST =====");

        const currentName = "Royal Botanic Gardens, Peradeniya";
        const targetName = "Colombo";

        const current = await findByName(currentName);
        const target = await findByName(targetName);

        if (!current) {
            throw new Error(`Current place not found: ${currentName}`);
        }

        if (!target) {
            throw new Error(`Target place not found: ${targetName}`);
        }

        console.log("\nCURRENT:");
        console.log(current);

        console.log("\nTARGET:");
        console.log(target);

        const result = await getSpatialCandidates(current.id, 20, 20);

        console.log("\n===== RAW CANDIDATES =====");
        console.table(result);

        const traced = [];

        for (const node of result) {

            const place = await findByID(node.id);

            if (!place) continue;

            const pass = isInDirectionBox(
                current,
                place,
                target
            );

            traced.push({
                id: place.id,
                name: place.name,
                spatialMeters: Math.round(node.distance),
                towardTarget: pass ? "YES" : "NO"
            });
        }

        console.log("\n===== FILTER CHECK =====");
        console.table(traced);

        console.log(
            "\nVALID COUNT:",
            traced.filter(x => x.towardTarget === "YES").length
        );

    } catch (err) {

        console.error("\nTEST FAILED:");
        console.error(err);
    }
}

runTest();