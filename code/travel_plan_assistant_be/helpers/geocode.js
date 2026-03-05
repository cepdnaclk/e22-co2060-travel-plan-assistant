const axios = require("axios");
const {findByName} = require("../services/destinationService");
const { isInsideSriLanka} = require("./utils");
const { geocodePlace } = require("../services/geocodeService");


/**
 * Get coordinates for a place
 * 1. Check the database first
 * 2. If not found, call ORS
 */

async function getCoordinates(place) {
    try {
        // Call destService to check the DB
        const dbresult = await findByName(place);

        if (dbresult) return dbresult;

        // ORS API call 
        const orsresult = await geocodePlace(place);
        if (!orsresult) return null;

        if (!isInsideSriLanka(orsresult.lat, orsresult.lng)){
            console.warn(`ORS result outside Sri Lanka: ${orsresult.lat}, ${orsresult.lng}`);
            return null;
        }

        return orsresult;

    } catch (error) {
        console.error("Geocode error:", error.message);
        return null;
    }
}

module.exports = {
    getCoordinates,
};