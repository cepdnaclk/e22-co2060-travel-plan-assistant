const { getNearbyDestinations } = require("./nearby")
const { findClosestDistrict } = require("./district")
const  { populateNearby } = require("./nearby");
const  { findByName, insertDestination } = require("../services/destinationService");
const  { getNextDestinationNumber, formatDestinationID } = require("../services/idService");
const { getAllDistricts } = require("../services/districtService");
const { getCoordinates } = require("./geocode");
const { areCoordsClose } = require("./utils");

/**
 * Save destination (main orchestration)
 */
async function saveDestination(placeName) {
    const existing = await findByName(placeName);
    if (existing) {
        console.log("Destination already exists");
        return existing;
    }

    const coords = await getCoordinates(placeName);
    if (!coords) return null;
    const { lat, lng } = coords;

    const nearby = await getNearbyDestinations(lat, lng, 0.2, 0.1);
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
    if (!district || !district.district_tag) {
        throw new Error("District or district_tag is undefined");
    }

    // Generate next destination number
    const nextNumber = await getNextDestinationNumber(district.district_tag);
    if (nextNumber === undefined || nextNumber === null) {
        throw new Error("Next destination number is undefined");
    }

    const destinationID = formatDestinationID(district.district_tag, nextNumber);

    // Insert destination
    await insertDestination({
        destinationID,
        district_name: district.district_name,
        district_tag: district.district_tag,
        name: placeName,
        lat,
        lng
    });

    await populateNearby(destinationID, lat, lng);

    return {
        destinationID,
        name: placeName,
        lat,
        lng
    };
}
module.exports ={
    saveDestination
}