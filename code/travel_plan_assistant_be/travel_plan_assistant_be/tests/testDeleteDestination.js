const { deleteDestination } = require("../services/databaseService");

async function run() {

    const idToDelete = 1;

    console.log("Deleting destination:", idToDelete);

    const result = await deleteDestination(idToDelete);

    console.log("Result:", result);
}

run();