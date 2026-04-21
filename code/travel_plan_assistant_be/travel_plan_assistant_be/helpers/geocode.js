const axios = require("axios");
const {findByName} = require("../services/destinationService");
const { isInsideSriLanka} = require("./utils");
const { geocodePlace } = require("../services/geocodeService");
const { safeORSCall } = require("./safeORS");

/**
 * Get coordinates for a place
 * 1. Check the database first
 * 2. If not found, call ORS
 */

async function getCoordinates(place) {
    try {
        const dbresult = await findByName(place);
        if (dbresult) return dbresult;

        const orsresult = await safeORSCall(() => geocodePlace(place));

        if (!orsresult) return null;

        if (!isInsideSriLanka(orsresult.lat, orsresult.lng)) {
            console.warn(`Outside Sri Lanka: ${place}`);
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