const db = require("../config/db");

/**
 * Checks if hotel exists by name
 */
async function findHotelByName(name) {
  const [rows] = await db.execute(
    "SELECT hotel_id, name, lat, lng FROM hotels WHERE name = ? LIMIT 1",
    [name]
  );
  if (!rows.length) return null;
  return {
    id: rows[0].hotel_id,
    name: rows[0].name,
    lat: parseFloat(rows[0].lat),
    lng: parseFloat(rows[0].lng)
  };
}

/**
 * Insert hotel into database
 */
async function insertHotel({
  name,
  district_id = null,
  destination_id = null,
  lat,
  lng,
  address = null,
  rating = null,
  user_ratings_total = 0,
  price_level = null,
  hotel_type = null,
  place_id = null,
  description = null,
  photos = null,
  display_picture = null,
  phone_number = null,
  website = null,
  amenities = null,
  user_reviews = null
}) {
  const [result] = await db.execute(
    `INSERT INTO hotels
      (name, district_id, destination_id, lat, lng, coords, address, rating, user_ratings_total, price_level, hotel_type, place_id, description, photos, display_picture, phone_number, website, amenities, user_reviews, created_at)
     VALUES (?, ?, ?, ?, ?, POINT(?, ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      name,
      district_id,
      destination_id,
      lat,
      lng,
      lng,
      lat,
      address,
      rating,
      user_ratings_total,
      price_level,
      hotel_type,
      place_id,
      description,
      photos ? JSON.stringify(photos) : null,
      display_picture,
      phone_number,
      website,
      amenities ? JSON.stringify(amenities) : null,
      user_reviews ? JSON.stringify(user_reviews) : null
    ]
  );
  return result.insertId;
}

/**
 * Get all hotels with optional district or search filter
 */
async function getAllHotels({ district_id = null, search = null } = {}) {
  let query = `
    SELECT h.hotel_id, h.name, h.lat, h.lng, h.address, h.rating, h.user_ratings_total,
           h.price_level, h.hotel_type, h.description, h.display_picture, h.phone_number,
           h.website, h.amenities, dist.district_name
    FROM hotels h
    LEFT JOIN districts dist ON h.district_id = dist.district_id
    WHERE 1=1
  `;
  const params = [];

  if (district_id) {
    query += " AND h.district_id = ?";
    params.push(district_id);
  }

  if (search && search.trim()) {
    query += " AND (h.name LIKE ? OR dist.district_name LIKE ?)";
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  query += " ORDER BY h.rating DESC, h.name ASC";

  const [rows] = await db.execute(query, params);

  return rows.map(r => ({
    ...r,
    amenities: r.amenities ? (typeof r.amenities === "string" ? JSON.parse(r.amenities) : r.amenities) : []
  }));
}

/**
 * Get hotel by ID
 */
async function getHotelById(hotelId) {
  const [rows] = await db.execute(
    `SELECT h.*, dist.district_name
     FROM hotels h
     LEFT JOIN districts dist ON h.district_id = dist.district_id
     WHERE h.hotel_id = ? LIMIT 1`,
    [hotelId]
  );

  if (!rows.length) return null;
  const hotel = rows[0];

  return {
    ...hotel,
    lat: parseFloat(hotel.lat),
    lng: parseFloat(hotel.lng),
    photos: hotel.photos ? (typeof hotel.photos === "string" ? JSON.parse(hotel.photos) : hotel.photos) : [],
    user_reviews: hotel.user_reviews ? (typeof hotel.user_reviews === "string" ? JSON.parse(hotel.user_reviews) : hotel.user_reviews) : [],
    amenities: hotel.amenities ? (typeof hotel.amenities === "string" ? JSON.parse(hotel.amenities) : hotel.amenities) : []
  };
}

/**
 * Find nearby hotels within radiusKm (using ST_Distance_Sphere in meters)
 */
async function getNearbyHotels(lat, lng, radiusKm = 25, limit = 6) {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 6);
  const radiusMeters = parseFloat(radiusKm) * 1000;

  const query = `
    SELECT h.hotel_id, h.name, h.lat, h.lng, h.address, h.rating, h.user_ratings_total,
           h.price_level, h.hotel_type, h.description, h.display_picture, h.phone_number,
           h.website, h.amenities, dist.district_name,
           ROUND(ST_Distance_Sphere(h.coords, POINT(?, ?)) / 1000, 1) AS distance_km,
           ST_Distance_Sphere(h.coords, POINT(?, ?)) AS distance_meters
    FROM hotels h
    LEFT JOIN districts dist ON h.district_id = dist.district_id
    HAVING distance_meters <= ?
    ORDER BY distance_km ASC, h.rating DESC
    LIMIT ${safeLimit}
  `;

  const [rows] = await db.execute(query, [lng, lat, lng, lat, radiusMeters]);

  return rows.map(r => ({
    ...r,
    amenities: r.amenities ? (typeof r.amenities === "string" ? JSON.parse(r.amenities) : r.amenities) : []
  }));
}

module.exports = {
  findHotelByName,
  insertHotel,
  getAllHotels,
  getHotelById,
  getNearbyHotels
};
