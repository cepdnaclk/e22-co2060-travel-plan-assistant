require("dotenv").config();
const { getNearbyDestinations } = require("../helpers/nearby");

(async () => {
        const lat = 7.25459200;   // Akbar Birdge
        const lng = 80.59515600;

    const nearby = await getNearbyDestinations(lat, lng, 5, 0.1);
    console.log("Nearby destinations:", nearby);
})();