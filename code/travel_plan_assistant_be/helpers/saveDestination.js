const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { getNearbyDestinations, populateNearby } = require("./nearby");
const { findClosestDistrict } = require("./district");
const { findByName, insertDestination, getPlaceDetails, downloadPlacePhoto } = require("../services/destinationService");
const { getAllDistricts } = require("../services/districtService");
const { findHotelByName, insertHotel } = require("../services/hotelService");
const { findRestaurantByName, insertRestaurant } = require("../services/restaurantService");
const { getCoordinates } = require("./geocode");
const { areCoordsClose } = require("./utils");

/**
 * Save destination (main orchestration)
 * Supports attractions, hotels, and restaurants with full consistency
 */
async function saveDestination(placeName, customType = null) {

    console.log(`[saveDestination] Processing: "${placeName}"`);
    
    if (typeof placeName !== "string") {
        throw new Error(
            `Geocode failed: expected string, got ${typeof placeName}`
        );
    }

    const existing = await findByName(placeName);
    if (existing) {
        console.log(`Destination "${placeName}" already exists (ID: ${existing.id || existing.destinationID})`);
        return existing;
    }

    const coords = await getCoordinates(placeName);

    if (!coords) {
        throw new Error(`Geocode failed for ${placeName}`);
    }
    
    const {
        place_id = null,
        lat,
        lng,
        rating = null,
        types = [],
        name = placeName
    } = coords;

    // Get photo refs, description and user reviews
    const placeDetails = await getPlaceDetails(place_id);

    if (!placeDetails) {
        throw new Error(`Failed to fetch place details for ${placeName}`);
    }

    // Determine type: customType > Google Places types > attraction default
    let resolvedType = customType;
    if (!resolvedType) {
        const typesLower = (types || []).map(t => (typeof t === "string" ? t.toLowerCase() : ""));
        if (typesLower.some(t => ["lodging", "hotel", "resort", "guest_house", "bed_and_breakfast"].includes(t))) {
            resolvedType = "hotel";
        } else if (typesLower.some(t => ["restaurant", "food", "cafe", "meal_takeaway", "bar", "bakery"].includes(t))) {
            resolvedType = "restaurant";
        } else {
            resolvedType = "attraction";
        }
    }

    const nearby = await getNearbyDestinations(lat, lng);
    for (const row of nearby) {
        // If exact same Google place_id, it's definitely a duplicate
        if (place_id && row.place_id && row.place_id === place_id) {
            console.log(`Duplicate destination detected by place_id (${place_id}):`, row.name);
            return row;
        }
        // If same type and extremely close (< 25 meters), treat as duplicate
        if (row.type === resolvedType && areCoordsClose(lat, lng, row.lat, row.lng, 0.025)) {
            console.log(`Duplicate ${resolvedType} detected at same spot:`, row.name);
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

    // Download display picture using FIRST photo reference
    let displayPicture = null;

    if (placeDetails.photos && placeDetails.photos.length > 0) {
        const firstRef = placeDetails.photos[0];
        const fileName = `${place_id || name}.jpg`;
        const savedPath = await downloadPlacePhoto(firstRef, fileName);

        if (savedPath) {
            displayPicture = fileName;

            // Also mirror photo to entity specific directories
            try {
                if (resolvedType === "hotel") {
                    const hDir = path.join(__dirname, "../public/hotels");
                    if (!fs.existsSync(hDir)) fs.mkdirSync(hDir, { recursive: true });
                    fs.copyFileSync(savedPath, path.join(hDir, fileName));
                } else if (resolvedType === "restaurant") {
                    const rDir = path.join(__dirname, "../public/restaurants");
                    if (!fs.existsSync(rDir)) fs.mkdirSync(rDir, { recursive: true });
                    fs.copyFileSync(savedPath, path.join(rDir, fileName));
                }
            } catch (copyErr) {
                // non-fatal
            }
        }
    }

    // Insert destination with resolved type
    const destinationID = await insertDestination({
        district_id: district.district_id,
        name,
        lat,
        lng,
        rating: placeDetails.rating || rating,
        tag: types || [],
        place_id,
        description: placeDetails.description,
        photos: placeDetails.photos,
        user_reviews: placeDetails.reviews,
        display_picture: displayPicture,
        type: resolvedType
    });

    // If type is hotel or restaurant, populate the respective child table
    if (resolvedType === "hotel") {
        const existingHotel = await findHotelByName(name);
        if (!existingHotel) {
            await insertHotel({
                name,
                district_id: district.district_id,
                destination_id: destinationID,
                lat,
                lng,
                address: placeDetails.address || null,
                rating: placeDetails.rating || rating,
                user_ratings_total: placeDetails.user_ratings_total || 0,
                price_level: placeDetails.price_level,
                hotel_type: "Hotel",
                place_id,
                description: placeDetails.description,
                photos: placeDetails.photos,
                display_picture: displayPicture,
                phone_number: placeDetails.phone_number,
                website: placeDetails.website,
                amenities: ["Free Wi-Fi", "Air conditioning", "Room service"],
                user_reviews: placeDetails.reviews
            });
            console.log(`[saveDestination] Inserted into hotels table with destination_id: ${destinationID}`);
        } else {
            await db.execute(
                "UPDATE hotels SET destination_id = ? WHERE hotel_id = ?",
                [destinationID, existingHotel.id]
            );
            console.log(`[saveDestination] Linked existing hotel '${name}' with destination_id: ${destinationID}`);
        }
    } else if (resolvedType === "restaurant") {
        const existingRestaurant = await findRestaurantByName(name);
        if (!existingRestaurant) {
            await insertRestaurant({
                name,
                district_id: district.district_id,
                destination_id: destinationID,
                lat,
                lng,
                address: placeDetails.address || null,
                rating: placeDetails.rating || rating,
                user_ratings_total: placeDetails.user_ratings_total || 0,
                price_level: placeDetails.price_level,
                cuisine_type: "Local Cuisine",
                place_id,
                description: placeDetails.description,
                photos: placeDetails.photos,
                display_picture: displayPicture,
                phone_number: placeDetails.phone_number,
                website: placeDetails.website,
                opening_hours: placeDetails.opening_hours,
                user_reviews: placeDetails.reviews
            });
            console.log(`[saveDestination] Inserted into restaurants table with destination_id: ${destinationID}`);
        } else {
            await db.execute(
                "UPDATE restaurants SET destination_id = ? WHERE restaurant_id = ?",
                [destinationID, existingRestaurant.id]
            );
            console.log(`[saveDestination] Linked existing restaurant '${name}' with destination_id: ${destinationID}`);
        }
    }

    // Populate nearby destinations
    await populateNearby(destinationID, lat, lng);

    return {
        id: destinationID,
        destinationID,
        name,
        lat,
        lng,
        type: resolvedType
    };
}

module.exports = {
    saveDestination
};