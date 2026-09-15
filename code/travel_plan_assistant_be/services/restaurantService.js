const db = require("../config/db");

/**
 * Checks if restaurant exists by name
 */
async function findRestaurantByName(name) {
  const [rows] = await db.execute(
    "SELECT restaurant_id, name, lat, lng FROM restaurants WHERE name = ? LIMIT 1",
    [name]
  );
  if (!rows.length) return null;
  return {
    id: rows[0].restaurant_id,
    name: rows[0].name,
    lat: parseFloat(rows[0].lat),
    lng: parseFloat(rows[0].lng)
  };
}

/**
 * Insert restaurant into database
 */
async function insertRestaurant({
  name,
  district_id = null,
  destination_id = null,
  lat,
  lng,
  address = null,
  rating = null,
  user_ratings_total = 0,
  price_level = null,
  cuisine_type = null,
  place_id = null,
  description = null,
  photos = null,
  display_picture = null,
  phone_number = null,
  website = null,
  opening_hours = null,
  user_reviews = null
}) {
  const [result] = await db.execute(
    `INSERT INTO restaurants
      (name, district_id, destination_id, lat, lng, coords, address, rating, user_ratings_total, price_level, cuisine_type, place_id, description, photos, display_picture, phone_number, website, opening_hours, user_reviews, created_at)
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
      cuisine_type,
      place_id,
      description,
      photos ? JSON.stringify(photos) : null,
      display_picture,
      phone_number,
      website,
      opening_hours ? JSON.stringify(opening_hours) : null,
      user_reviews ? JSON.stringify(user_reviews) : null
    ]
  );
  return result.insertId;
}

/**
 * Get all restaurants with optional filters
 */
async function getAllRestaurants({ district_id = null, cuisine = null, search = null } = {}) {
  let query = `
    SELECT r.restaurant_id, r.name, r.lat, r.lng, r.address, r.rating, r.user_ratings_total,
           r.price_level, r.cuisine_type, r.description, r.display_picture, r.phone_number,
           r.website, r.opening_hours, dist.district_name
    FROM restaurants r
    LEFT JOIN districts dist ON r.district_id = dist.district_id
    WHERE 1=1
  `;
  const params = [];

  if (district_id) {
    query += " AND r.district_id = ?";
    params.push(district_id);
  }

  if (cuisine && cuisine.trim()) {
    query += " AND r.cuisine_type LIKE ?";
    params.push(`%${cuisine.trim()}%`);
  }

  if (search && search.trim()) {
    query += " AND (r.name LIKE ? OR dist.district_name LIKE ? OR r.cuisine_type LIKE ?)";
    params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
  }

  query += " ORDER BY r.rating DESC, r.name ASC";

  const [rows] = await db.execute(query, params);

  return rows.map(r => ({
    ...r,
    opening_hours: r.opening_hours ? (typeof r.opening_hours === "string" ? JSON.parse(r.opening_hours) : r.opening_hours) : null
  }));
}

/**
 * Get restaurant by ID
 */
async function getRestaurantById(restaurantId) {
  const [rows] = await db.execute(
    `SELECT r.*, dist.district_name
     FROM restaurants r
     LEFT JOIN districts dist ON r.district_id = dist.district_id
     WHERE r.restaurant_id = ? LIMIT 1`,
    [restaurantId]
  );

  if (!rows.length) return null;
  const restaurant = rows[0];

  return {
    ...restaurant,
    lat: parseFloat(restaurant.lat),
    lng: parseFloat(restaurant.lng),
    photos: restaurant.photos ? (typeof restaurant.photos === "string" ? JSON.parse(restaurant.photos) : restaurant.photos) : [],
    user_reviews: restaurant.user_reviews ? (typeof restaurant.user_reviews === "string" ? JSON.parse(restaurant.user_reviews) : restaurant.user_reviews) : [],
    opening_hours: restaurant.opening_hours ? (typeof restaurant.opening_hours === "string" ? JSON.parse(restaurant.opening_hours) : restaurant.opening_hours) : null
  };
}

/**
 * Find nearby restaurants within radiusKm
 */
async function getNearbyRestaurants(lat, lng, radiusKm = 15, limit = 6) {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 6);
  const radiusMeters = parseFloat(radiusKm) * 1000;

  const query = `
    SELECT r.restaurant_id, r.name, r.lat, r.lng, r.address, r.rating, r.user_ratings_total,
           r.price_level, r.cuisine_type, r.description, r.display_picture, r.phone_number,
           r.website, r.opening_hours, dist.district_name,
           ROUND(ST_Distance_Sphere(r.coords, POINT(?, ?)) / 1000, 1) AS distance_km,
           ST_Distance_Sphere(r.coords, POINT(?, ?)) AS distance_meters
    FROM restaurants r
    LEFT JOIN districts dist ON r.district_id = dist.district_id
    HAVING distance_meters <= ?
    ORDER BY distance_km ASC, r.rating DESC
    LIMIT ${safeLimit}
  `;

  const [rows] = await db.execute(query, [lng, lat, lng, lat, radiusMeters]);

  return rows.map(r => ({
    ...r,
    opening_hours: r.opening_hours ? (typeof r.opening_hours === "string" ? JSON.parse(r.opening_hours) : r.opening_hours) : null
  }));
}

module.exports = {
  findRestaurantByName,
  insertRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getNearbyRestaurants
};
