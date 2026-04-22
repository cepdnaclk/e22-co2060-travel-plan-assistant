require("dotenv").config();
const { getNearbyDestinations } = require("../helpers/nearby");

(async () => {
        const lat = 7.25459200;   // Akbar Birdge
        const lng = 80.59515600;

    const nearby = await getNearbyDestinations(lat, lng);
    console.log("Nearby destinations:", nearby);
})();