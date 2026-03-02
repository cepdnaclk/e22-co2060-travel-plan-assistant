const axios = require("axios");
const {findByName} = require("../services/destinationService");
const { isInsideSriLanka} = require("./utils");
const { getNearbyDestinations } = require("./nearby");
const { geocodePlace } = require("../services/geocodeService");
const { insertNearbyDestination, updateNearbyColumn } = require("../services/nearbyService");
const { getDistanceAndDuration } = require("../services/routeService");



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

/**
 * Populate nearby destinations for a given destination
 * @param {string} destinationID - ID of the source destination
 * @param {number} lat - Latitude of the source destination
 * @param {number} lng - Longitude of the source destination
 */
async function populateNearby(destinationID, lat, lng) {
    // Nearby Destination search upto 5km with 100m stepsize
    const nearbyRows = await getNearbyDestinations(lat, lng, 5, 0.1);

    if (!nearbyRows || nearbyRows.length === 0) return;

    const nearbyIDs = [];

    for (const target of nearbyRows) {
        if (target.destinationID === destinationID) continue; // skip self

        const nearbyID = `${destinationID}-${target.destinationID}`;

        // Call ORS to get route data
        const routeinfo = await getDistanceAndDuration(
            lat, lng, target.lat, target.lng
        );

        if (!routeinfo) {
            console.warn(`No route data found for ${nearbyID}, skipped`);;
            continue;
        }

        nearbyIDs.push(nearbyID)

        // Insert into nearby_destinations table
        await insertNearbyDestination(
            nearbyID,
            routeinfo.distance,
            routeinfo.duration
        );
        
    }

    // Update the nearby column in destination table
    await updateNearbyColumn(destinationID, nearbyIDs)
}


module.exports = {
    getCoordinates,
    populateNearby,
};