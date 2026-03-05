require("dotenv").config();
const { getDistanceAndDuration } = require("../services/routeService");

(async () => {
    const startLat = 7.254592;
    const startLng = 80.595156;
    const endLat = 7.259907;
    const endLng = 80.593475;

    const result = await getDistanceAndDuration(startLat, startLng, endLat, endLng);
    console.log("Route info:", result);
})();