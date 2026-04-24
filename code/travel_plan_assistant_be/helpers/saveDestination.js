const { getNearbyDestinations } = require("./nearby")
const { findClosestDistrict } = require("./district")
const  { populateNearby } = require("./nearby");
const  { findByName, insertDestination } = require("../services/destinationService");
const { getAllDistricts } = require("../services/districtService");
const { getCoordinates } = require("./geocode");
const { areCoordsClose } = require("./utils");

/**
 * Save destination (main orchestration)
 */
async function saveDestination(placeName) {

    console.log(placeName);
    
    if (typeof placeName !== "string") {
        throw new Error(
            `Geocode failed: expected string, got ${typeof placeName}`
        );
    }

    const existing = await findByName(placeName);
    if (existing) {
        console.log("Destination already exists");
        return existing;
    }

    const coords = await getCoordinates(placeName);

    if (!coords) {
        throw new Error(`Geocode failed for ${placeName}`);
    }
    
    const {
        lat,
        lng,
        rating = null,
        types = [],
        name = placeName
    } = coords;

    const nearby = await getNearbyDestinations(lat, lng);
    for (const row of nearby) {
        if (areCoordsClose(lat, lng, row.lat, row.lng)) {
            console.log("Duplicate destination detected");
            return row;
        }
    }

    // Get all districts properly (no lat/lng arguments)
    const districts = await getAllDistricts();
    if (!districts.length) {
        throw new Error("No districts found in DB");
    }

    const district = findClosestDistrict(lat, lng, districts);
    if (!district || !district.district_id) {
        throw new Error("District or district_id is undefined");
    }

    // Insert destination
    const destinationID = await insertDestination({
        district_id: district.district_id,
        name,
        lat,
        lng,
        rating,
        tag: types || []
    });

    await populateNearby(destinationID, lat, lng);

    return {
        id: destinationID,
        name: placeName,
        lat,
        lng
    };
}
module.exports ={
    saveDestination
}