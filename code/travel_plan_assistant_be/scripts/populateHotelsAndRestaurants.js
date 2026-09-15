const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = require("../config/db");
const { findHotelByName, insertHotel } = require("../services/hotelService");
const { findRestaurantByName, insertRestaurant } = require("../services/restaurantService");
const { insertDestination, findByName } = require("../services/destinationService");
const { getAllDistricts } = require("../services/districtService");
const { findClosestDistrict } = require("../helpers/district");
const { curatedHotels, curatedRestaurants } = require("./placesHotelsRestaurants");
const { sleep } = require("../helpers/safeAPI");

const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Downloads place photo and saves it to designated public folder and destinations folder
 */
async function downloadPhoto(photoReference, fileName, subFolder) {
  try {
    if (!photoReference || !API_KEY) return null;

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${API_KEY}`;
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 10000
    });

    const targetDir = path.join(__dirname, `../public/${subFolder}`);
    const destDir = path.join(__dirname, "../public/destinations");
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const filePath = path.join(targetDir, fileName);
    const destFilePath = path.join(destDir, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on("finish", () => {
        try {
          fs.copyFileSync(filePath, destFilePath);
        } catch (e) {
          // ignore copy error
        }
        resolve(fileName);
      });
      writer.on("error", (err) => {
        console.error(`Error saving photo ${fileName}:`, err.message);
        resolve(null);
      });
    });
  } catch (err) {
    console.error(`Photo download failed for ${fileName}:`, err.message);
    return null;
  }
}

/**
 * Fetch Google Place Details
 */
async function fetchGooglePlaceInfo(searchQuery) {
  try {
    // Step 1: Find place ID
    const findRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
      {
        params: {
          input: `${searchQuery} Sri Lanka`,
          inputtype: "textquery",
          fields: "place_id,name,geometry,rating",
          key: API_KEY,
        },
      }
    );

    const candidate = findRes.data?.candidates?.[0];
    if (!candidate || !candidate.place_id) {
      console.warn(`Could not find place ID for: ${searchQuery}`);
      return null;
    }

    const placeId = candidate.place_id;

    // Step 2: Fetch detailed place information
    const detailsRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "name,formatted_address,geometry,rating,user_ratings_total,price_level,photos,editorial_summary,reviews,formatted_phone_number,website,opening_hours",
          key: API_KEY,
        },
      }
    );

    const details = detailsRes.data?.result;
    if (!details) {
      console.warn(`Could not fetch details for: ${searchQuery}`);
      return null;
    }

    return {
      place_id: placeId,
      name: details.name || searchQuery,
      lat: details.geometry?.location?.lat,
      lng: details.geometry?.location?.lng,
      address: details.formatted_address || null,
      rating: details.rating || candidate.rating || null,
      user_ratings_total: details.user_ratings_total || 0,
      price_level: details.price_level != null ? details.price_level : null,
      description: details.editorial_summary?.overview || null,
      photos: (details.photos || []).slice(0, 5).map((p) => p.photo_reference),
      phone_number: details.formatted_phone_number || null,
      website: details.website || null,
      opening_hours: details.opening_hours?.weekday_text || null,
      reviews: (details.reviews || []).slice(0, 5).map((r) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
      })),
    };
  } catch (error) {
    console.error(`Google API error for ${searchQuery}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Main population function
 */
async function populateHotelsAndRestaurants() {
  console.log("==================================================");
  console.log("Starting Hotels & Restaurants Population Script...");
  console.log("==================================================");

  const districts = await getAllDistricts();
  if (!districts || districts.length === 0) {
    throw new Error("No districts found in DB. Please initialize districts first.");
  }

  // --- 1. Populate Hotels ---
  console.log(`\n🏨 Populating ${curatedHotels.length} Hotels...`);
  for (const item of curatedHotels) {
    try {
      console.log(`- Fetching details for hotel '${item.name}'...`);
      const info = await fetchGooglePlaceInfo(item.name);
      if (!info || !info.lat || !info.lng) {
        console.warn(`  ✗ Failed to retrieve Google Place info for ${item.name}`);
        continue;
      }

      const closestDistrict = findClosestDistrict(info.lat, info.lng, districts);

      let displayPicture = null;
      if (info.photos && info.photos.length > 0) {
        const photoRef = info.photos[0];
        const fileName = `${info.place_id || Date.now()}.jpg`;
        displayPicture = await downloadPhoto(photoRef, fileName, "hotels");
      }

      // Step 1: Insert into destinations table first with type='hotel'
      let destinationID = null;
      const existingDest = await findByName(info.name);
      if (existingDest) {
        destinationID = existingDest.id;
        await db.execute(
          "UPDATE destinations SET type = 'hotel' WHERE destinationID = ?",
          [destinationID]
        );
      } else {
        destinationID = await insertDestination({
          district_id: closestDistrict?.district_id || null,
          name: info.name,
          lat: info.lat,
          lng: info.lng,
          rating: info.rating,
          tag: ["lodging", "hotel", item.type?.toLowerCase().replace(/\s+/g, "_") || "hotel"],
          place_id: info.place_id,
          description: info.description,
          photos: info.photos,
          user_reviews: info.reviews,
          display_picture: displayPicture,
          type: "hotel",
        });
      }

      // Step 2: Insert / update hotel in hotels table with destination_id
      const existingHotel = await findHotelByName(info.name);
      if (existingHotel) {
        await db.execute(
          "UPDATE hotels SET destination_id = ? WHERE hotel_id = ?",
          [destinationID, existingHotel.id]
        );
        console.log(`  ✓ Updated hotel '${info.name}' with destination_id = ${destinationID}`);
      } else {
        await insertHotel({
          name: info.name,
          district_id: closestDistrict?.district_id || null,
          destination_id: destinationID,
          lat: info.lat,
          lng: info.lng,
          address: info.address,
          rating: info.rating,
          user_ratings_total: info.user_ratings_total,
          price_level: info.price_level,
          hotel_type: item.type || "Hotel",
          place_id: info.place_id,
          description: info.description,
          photos: info.photos,
          display_picture: displayPicture,
          phone_number: info.phone_number,
          website: info.website,
          amenities: ["Free Wi-Fi", "Air conditioning", "Pool", "Room service"],
          user_reviews: info.reviews
        });
        console.log(`  ✓ Inserted hotel '${info.name}' (destinationID: ${destinationID})`);
      }

      await sleep(1000);
    } catch (err) {
      console.error(`  ✗ Error processing hotel '${item.name}':`, err.message);
    }
  }

  // --- 2. Populate Restaurants ---
  console.log(`\n🍽️ Populating ${curatedRestaurants.length} Restaurants...`);
  for (const item of curatedRestaurants) {
    try {
      console.log(`- Fetching details for restaurant '${item.name}'...`);
      const info = await fetchGooglePlaceInfo(item.name);
      if (!info || !info.lat || !info.lng) {
        console.warn(`  ✗ Failed to retrieve Google Place info for ${item.name}`);
        continue;
      }

      const closestDistrict = findClosestDistrict(info.lat, info.lng, districts);

      let displayPicture = null;
      if (info.photos && info.photos.length > 0) {
        const photoRef = info.photos[0];
        const fileName = `${info.place_id || Date.now()}.jpg`;
        displayPicture = await downloadPhoto(photoRef, fileName, "restaurants");
      }

      // Step 1: Insert into destinations table first with type='restaurant'
      let destinationID = null;
      const existingDest = await findByName(info.name);
      if (existingDest) {
        destinationID = existingDest.id;
        await db.execute(
          "UPDATE destinations SET type = 'restaurant' WHERE destinationID = ?",
          [destinationID]
        );
      } else {
        destinationID = await insertDestination({
          district_id: closestDistrict?.district_id || null,
          name: info.name,
          lat: info.lat,
          lng: info.lng,
          rating: info.rating,
          tag: ["restaurant", "food", item.cuisine?.toLowerCase().replace(/\s+/g, "_") || "restaurant"],
          place_id: info.place_id,
          description: info.description,
          photos: info.photos,
          user_reviews: info.reviews,
          display_picture: displayPicture,
          type: "restaurant",
        });
      }

      // Step 2: Insert / update restaurant in restaurants table with destination_id
      const existingRestaurant = await findRestaurantByName(info.name);
      if (existingRestaurant) {
        await db.execute(
          "UPDATE restaurants SET destination_id = ? WHERE restaurant_id = ?",
          [destinationID, existingRestaurant.id]
        );
        console.log(`  ✓ Updated restaurant '${info.name}' with destination_id = ${destinationID}`);
      } else {
        await insertRestaurant({
          name: info.name,
          district_id: closestDistrict?.district_id || null,
          destination_id: destinationID,
          lat: info.lat,
          lng: info.lng,
          address: info.address,
          rating: info.rating,
          user_ratings_total: info.user_ratings_total,
          price_level: info.price_level,
          cuisine_type: item.cuisine || "Sri Lankan",
          place_id: info.place_id,
          description: info.description,
          photos: info.photos,
          display_picture: displayPicture,
          phone_number: info.phone_number,
          website: info.website,
          opening_hours: info.opening_hours,
          user_reviews: info.reviews
        });
        console.log(`  ✓ Inserted restaurant '${info.name}' (destinationID: ${destinationID})`);
      }

      await sleep(1000);
    } catch (err) {
      console.error(`  ✗ Error processing restaurant '${item.name}':`, err.message);
    }
  }

  console.log("\n==================================================");
  console.log("Population completed successfully with destination IDs!");
  console.log("==================================================");
}

if (require.main === module) {
  populateHotelsAndRestaurants()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal population error:", err);
      process.exit(1);
    });
}

module.exports = { populateHotelsAndRestaurants };
