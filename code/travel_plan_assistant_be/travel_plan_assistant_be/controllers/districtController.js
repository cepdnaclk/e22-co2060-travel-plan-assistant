const { getAllDistricts } = require("../services/districtService");
const { findClosestDistrict } = require("../helpers/district");

// Calls districtService and District to get the closest district
async function getClosestDistrictController(req, res) {
    try {
        const {lat, lng} = req.body;

        // Call DB and get a list of district objs
        const districts = await getAllDistricts();

        // Call helper to get the closest distrcit
        const result = findClosestDistrict(lat, lng, districts);

        res.json(result);

    }catch (error) {
        res.status(500).json({ error: error.message } );
    }
}