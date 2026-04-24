require("dotenv").config();
const { getDistanceAndDuration } = require("../services/routeService");

(async () => {
    const startLat = 7.25459200;
    const startLng = 80.59515600;
    const endLat = 7.16149800;
    const endLng = 80.54725400;

    const result = await getDistanceAndDuration(startLat, startLng, endLat, endLng);
    console.log("Route info:", result);
})();