require("dotenv").config();
const { getCoordinates } = require("../helpers/geocode");

(async () => {
    const result = await getCoordinates("Wadduwa"); // Add a destination here to check
    console.log(result);
})();