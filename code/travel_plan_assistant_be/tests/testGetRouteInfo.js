require("dotenv").config();

const { getRouteInfo } = require("../services/distanceService");

async function runTest() {

    const pairs = [
        ["Colombo", "Kandy"],
        ["Kandy", "Ella"],
        ["Ella", "Galle"],
        ["Colombo", "Galle"]
    ];

    for (const [from, to] of pairs) {
        try {
            const result = await getRouteInfo(from, to);

            console.log("\n==========================");
            console.log(`${from} -> ${to}`);
            console.log(result);

        } catch (err) {
            console.log(`FAILED: ${from} -> ${to}`);
            console.log(err.message);
        }
    }
}

runTest();