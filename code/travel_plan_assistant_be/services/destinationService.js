const db = require("../config/db");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const API_KEY = process.env.GOOGLE_API_KEY;

// Checks the destination already exist in DB before API call
async function findByName(place) {
  const [rows] = await db.execute(
    "SELECT destinationID, name, lat, lng, type FROM destinations WHERE name = ? LIMIT 1",
    [place],
  );

  if (!rows.length) return null;

  return {
    id: rows[0].destinationID,
    destinationID: rows[0].destinationID,
    name: rows[0].name,
    lat: parseFloat(rows[0].lat),
    lng: parseFloat(rows[0].lng),
    type: rows[0].type || "attraction",
  };
}

/**
 * Returns destination data for the given ID
 */
async function findByID(id) {
  const [rows] = await db.execute(
    `SELECT d.destinationID, d.name, d.lat, d.lng, d.rating, d.tag, d.description, d.user_reviews, d.display_picture, d.type, d.district_id, dist.district_name,
            h.hotel_id, h.hotel_type, h.price_level as hotel_price_level, h.phone_number as hotel_phone, h.website as hotel_website,
            r.restaurant_id, r.cuisine_type, r.price_level as restaurant_price_level, r.phone_number as restaurant_phone, r.website as restaurant_website, r.opening_hours
     FROM destinations d
     LEFT JOIN districts dist ON d.district_id = dist.district_id
     LEFT JOIN hotels h ON d.destinationID = h.destination_id
     LEFT JOIN restaurants r ON d.destinationID = r.destination_id
     WHERE d.destinationID = ? LIMIT 1`,
    [id],
  );

  if (!rows.length) return null;

  const row = rows[0];
  let parsedTag = row.tag;
  if (typeof row.tag === "string") {
    try {
      parsedTag = JSON.parse(row.tag);
    } catch (e) {
      parsedTag = [row.tag];
    }
  }

  let parsedReviews = row.user_reviews;
  if (typeof row.user_reviews === "string") {
    try {
      parsedReviews = JSON.parse(row.user_reviews);
    } catch (e) {
      parsedReviews = [];
    }
  }

  return {
    id: row.destinationID,
    destinationID: row.destinationID,
    name: row.name,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    rating: row.rating,
    tag: parsedTag,
    type: row.type || "attraction",
    description: row.description,
    user_reviews: parsedReviews,
    display_picture: row.display_picture,
    district_name: row.district_name,
    hotel_id: row.hotel_id,
    hotel_type: row.hotel_type,
    hotel_price_level: row.hotel_price_level,
    hotel_phone: row.hotel_phone,
    hotel_website: row.hotel_website,
    restaurant_id: row.restaurant_id,
    cuisine_type: row.cuisine_type,
    restaurant_price_level: row.restaurant_price_level,
    restaurant_phone: row.restaurant_phone,
    restaurant_website: row.restaurant_website,
    opening_hours: row.opening_hours,
  };
}
/**
 * Get district tag for a district name
 */
async function getDistrictID(district_name) {
  const [rows] = await db.execute(
    "SELECT district_id FROM districts WHERE district_name = ? LIMIT 1",
    [district_name],
  );
  return rows.length ? rows[0].district_tag : null;
}

/**
 * Insert destination into the database
 */
async function insertDestination({
  district_id,
  name,
  lat,
  lng,
  rating = null,
  tag = null,
  place_id = null,
  description = null,
  photos = null,
  user_reviews = null,
  display_picture = null,
  type = "attraction",
}) {
  const [result] = await db.execute(
    `INSERT INTO destinations
            (name, lat, lng, rating, created_at, coords, district_id, tag, place_id, description, photos, user_reviews, display_picture, type)
            VALUES (?, ?, ?, ?, NOW(), POINT(?, ?), ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      lat,
      lng,
      rating,
      lng,
      lat,
      district_id,
      tag ? (Array.isArray(tag) ? JSON.stringify(tag) : tag) : null,
      place_id,
      description,
      photos ? JSON.stringify(photos) : null,
      user_reviews ? JSON.stringify(user_reviews) : null,
      display_picture,
      type,
    ],
  );

  return result.insertId;
}

async function getAllDestinations() {
  const [rows] = await db.execute(`
    SELECT d.destinationID, d.name, d.rating, d.tag, d.description, d.display_picture, d.type, d.district_id, dist.district_name,
           h.hotel_id, h.hotel_type, h.price_level as hotel_price_level, h.phone_number as hotel_phone, h.website as hotel_website,
           r.restaurant_id, r.cuisine_type, r.price_level as restaurant_price_level, r.phone_number as restaurant_phone, r.website as restaurant_website, r.opening_hours
    FROM destinations d
    LEFT JOIN districts dist ON d.district_id = dist.district_id
    LEFT JOIN hotels h ON d.destinationID = h.destination_id
    LEFT JOIN restaurants r ON d.destinationID = r.destination_id
    ORDER BY d.destinationID ASC
  `);

  return rows.map((r) => {
    let parsedTag = r.tag;
    if (typeof r.tag === "string") {
      try {
        parsedTag = JSON.parse(r.tag);
      } catch (e) {
        parsedTag = [r.tag];
      }
    }
    return {
      ...r,
      type: r.type || "attraction",
      tag: parsedTag,
    };
  });
}

async function getPlaceDetails(placeId) {
  try {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "name,formatted_address,geometry,rating,user_ratings_total,price_level,photos,reviews,editorial_summary,formatted_phone_number,website,opening_hours",
          key: API_KEY,
        },
      },
    );

    const result = res.data.result;

    if (!result) return null;

    return {
      name: result.name || null,
      address: result.formatted_address || null,
      rating: result.rating || null,
      user_ratings_total: result.user_ratings_total || 0,
      price_level: result.price_level != null ? result.price_level : null,
      phone_number: result.formatted_phone_number || null,
      website: result.website || null,
      opening_hours: result.opening_hours?.weekday_text || null,
      description: result.editorial_summary?.overview || null,

      photos: (result.photos || []).slice(0, 10).map((p) => p.photo_reference),

      reviews: (result.reviews || []).slice(0, 5).map((r) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
      })),
    };
  } catch (err) {
    console.error("Details fetch error:", err.response?.data || err.message);
    return null;
  }
}

async function getTrendingDestinations() {
  const [rows] = await db.execute(
    "SELECT destinationID, name, rating, display_picture FROM destinations ORDER BY rating DESC LIMIT 6",
  );

  return rows;
}

/**
 * Downloads a Google Places photo and saves it locally
 * @param {string} photoReference - Google photo_reference
 * @param {string} fileName - output file name (e.g. placeId.jpg)
 * @returns {Promise<string>} - saved file path
 */
async function downloadPlacePhoto(photoReference, fileName) {
  try {
    if (!photoReference) {
      throw new Error("Missing photoReference");
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${API_KEY}`;

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const dir = path.join(__dirname, "../public/destinations");

    // ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileName);

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (err) {
    console.error("Photo download failed:", err.message);
    return null;
  }
}

module.exports = {
  findByName,
  findByID,
  getDistrictID,
  insertDestination,
  getAllDestinations,
  getPlaceDetails,
  downloadPlacePhoto,
  getTrendingDestinations,
};
