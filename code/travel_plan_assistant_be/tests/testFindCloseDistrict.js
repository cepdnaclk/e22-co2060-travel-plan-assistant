
require("dotenv").config();
const { findClosestDistrict } = require("../helpers/district");
const { getAllDistricts } = require("../services/districtService");

(async () => {
    try {
        // Example coordinates somewhere in Sri Lanka
        const lat = 7.254592;  
        const lng = 80.595156;

        const districts = await getAllDistricts();
        const district = findClosestDistrict(lat, lng, districts)

        if (!district) {
            console.log("No district found");
        } else {
            console.log(`Closest district for (${lat}, ${lng}):`, district);
        }
    } catch (err) {
        console.error("Error testing findClosestDistrict:", err.message);
    }
})();