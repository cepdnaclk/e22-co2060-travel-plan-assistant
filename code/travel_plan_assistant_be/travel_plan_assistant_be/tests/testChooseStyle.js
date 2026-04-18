const { getNeighbors, chooseNeighborByStyle } = require("../services/plannerService");

require("dotenv").config();

async function runTest() {

    try {

        const destinationID = 1; // change to a valid ID in your DB

        const neighbors = await getNeighbors(destinationID);

        console.log("All Neighbors:");
        console.log(neighbors);

        const visited = new Set();

        console.log("\nShortest:");
        console.log(
            chooseNeighborByStyle(
                "shortest",
                neighbors,
                visited
            )
        );

        console.log("\nAverage:");
        console.log(
            chooseNeighborByStyle(
                "average",
                neighbors,
                visited
            )
        );

        console.log("\nLongest:");
        console.log(
            chooseNeighborByStyle(
                "longest",
                neighbors,
                visited
            )
        );

        visited.add(
            chooseNeighborByStyle(
                "shortest",
                neighbors,
                visited
            ).id
        );

        console.log("\nAfter marking shortest as visited:");

        console.log("\nShortest:");
        console.log(
            chooseNeighborByStyle(
                "shortest",
                neighbors,
                visited
            )
        );

        console.log("\nAverage:");
        console.log(
            chooseNeighborByStyle(
                "average",
                neighbors,
                visited
            )
        );

        console.log("\nLongest:");
        console.log(
            chooseNeighborByStyle(
                "longest",
                neighbors,
                visited
            )
        );

    } catch (err) {

        console.error("TEST FAILED:", err.message);
    }
}

runTest();