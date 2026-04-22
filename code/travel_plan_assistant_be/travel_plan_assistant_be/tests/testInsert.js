const { getCoordinates } = require("../helpers/geocode");
require('dotenv').config();

const { saveDestination } = require("../helpers/saveDestination");

(async () => {
    const res = await saveDestination("Peradeniya");
    console.log(res);
})();