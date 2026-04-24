require("dotenv").config();

const {
    getSpatialCandidates,
    getCandidateRoutes
} = require("../services/neighborService");

async function runTest() {

    try {

        console.log("\n===== STEP 1: GET CANDIDATES =====");

        const candidates = await getSpatialCandidates(431, 10, 10);

        console.table(candidates);

        console.log("\n===== STEP 2: GET ROUTES =====");

        const routes = await getCandidateRoutes(431, candidates);

        console.table(routes);

        console.log("\nTotal Routes:", routes.length);

    } catch (err) {

        console.error("TEST FAILED:");
        console.error(err);
    }
}

runTest();