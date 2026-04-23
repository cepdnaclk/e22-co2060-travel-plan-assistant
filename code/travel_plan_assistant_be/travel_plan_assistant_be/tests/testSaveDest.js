// testSaveDestination.js
require('dotenv').config();
const { saveDestination } = require("../helpers/saveDestination");

(async () => {
    
    try {
        const placeName = "Chilaw Beach Park"; // Change this to test different places
        const result = await saveDestination(placeName);

        if (!result) {
            console.log(`Could not save destination: "${placeName}"`);
        } else {
            console.log(`Saved/Found destination:`, result);
        }
    } catch (err) {
        console.error("Error testing saveDestination:", err.message);
    }
})();