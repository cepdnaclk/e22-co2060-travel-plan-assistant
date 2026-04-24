require("dotenv").config();

const { getDistanceAndDuration } = require("../services/routeService");

(async () => {
    try {
        const result = await getDistanceAndDuration(
            7.2906,   // Kandy
            80.6337,
            7.2622,   // Peradeniya
            80.5841
        );

        console.log("ROUTE RESULT:");
        console.log(result);

    } catch (error) {
        console.error("TEST FAILED:");
        console.error(error.message);
    }

    process.exit();
})();