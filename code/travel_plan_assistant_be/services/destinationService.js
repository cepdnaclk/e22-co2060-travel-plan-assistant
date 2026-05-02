const db = require("../config/db");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const API_KEY = process.env.GOOGLE_API_KEY;

// Checks the destination already exist in DB before API call
async function findByName(place) {
  const [rows] = await db.execute(
    "SELECT destinationID, name, lat, lng FROM destinations WHERE name = ? LIMIT 1",
    [place],
  );

  if (!rows.length) return null;

  return {
    id: rows[0].destinationID,
    name: rows[0].name,
    lat: parseFloat(rows[0].lat),
    lng: parseFloat(rows[0].lng),
  };
}

/**
 * Returns destination data for the given ID
 */
async function findByID(id) {

  const [rows] = await db.execute(
    "SELECT destinationID, name, lat, lng, rating, tag, description, user_reviews, display_picture FROM destinations WHERE destinationID = ? LIMIT 1",
    [id],
  );


  if (!rows.length) return null;

  return {
    id: rows[0].destinationID,
    name: rows[0].name,
    lat: parseFloat(rows[0].lat),
    lng: parseFloat(rows[0].lng),
    rating: rows[0].rating,
    tag: rows[0].tag,
    description: rows[0].description,
    user_reviews: rows[0].user_reviews,
    display_picture: rows[0].display_picture
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
}) {
  const [result] = await db.execute(
    `INSERT INTO destinations
            (name, lat, lng, rating, created_at, coords, district_id, tag, place_id, description, photos, user_reviews, display_picture)
            VALUES (?, ?, ?, ?, NOW(), POINT(?, ?), ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      lat,
      lng,
      rating,
      lng,
      lat,
      district_id,
      tag,
      place_id,
      description,
      photos ? JSON.stringify(photos) : null,
      user_reviews ? JSON.stringify(user_reviews) : null,
      display_picture,
    ],
  );

  return result.insertId;
}

async function getAllDestinations() {
  const [rows] = await db.execute(
    "SELECT destinationID, name, rating, tag, description, display_picture FROM destinations",
  );

  return rows;
}

async function getPlaceDetails(placeId) {
  try {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "photos,reviews,editorial_summary",
          key: API_KEY,
        },
      },
    );

    const result = res.data.result;

    if (!result) return null;

    return {
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
};
