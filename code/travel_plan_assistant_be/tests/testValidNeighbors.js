require("dotenv").config();

const {
    getSpatialCandidates,
    getCandidateRoutes,
    getValidNeighbors
} = require("../services/neighborService");

async function runTest() {

    try {

        const sourceID = 430;

        console.log("\n===== STEP 1: CANDIDATES =====");

        const candidates =
            await getSpatialCandidates(sourceID, 10, 10);

        console.table(candidates);

        console.log("\n===== STEP 2: ROUTES =====");

        const routes =
            await getCandidateRoutes(sourceID, candidates);

        console.table(routes);

        console.log("\n===== STEP 3: VALID NEIGHBORS =====");

        const valid =
            getValidNeighbors(routes, 25);

        console.table(valid);

        console.log("\nTotal Valid:", valid.length);

    } catch (err) {

        console.error("TEST FAILED:");
        console.error(err);
    }
}

runTest();