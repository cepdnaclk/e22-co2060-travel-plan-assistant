const hotelService = require("../services/hotelService");
const restaurantService = require("../services/restaurantService");

/**
 * Controller for Hotels and Restaurants
 */
async function getHotels(req, res) {
  try {
    const { district_id, search } = req.query;
    const hotels = await hotelService.getAllHotels({
      district_id: district_id ? parseInt(district_id, 10) : null,
      search
    });
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
}

async function getHotelDetails(req, res) {
  try {
    const hotel = await hotelService.getHotelById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json(hotel);
  } catch (err) {
    console.error("Error fetching hotel details:", err);
    res.status(500).json({ error: "Failed to fetch hotel details" });
  }
}

async function getNearbyHotels(req, res) {
  try {
    const { lat, lng, radius, limit } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const radiusKm = radius ? parseFloat(radius) : 25;
    const maxResults = limit ? parseInt(limit, 10) : 6;

    const nearby = await hotelService.getNearbyHotels(
      parseFloat(lat),
      parseFloat(lng),
      radiusKm,
      maxResults
    );
    res.json(nearby);
  } catch (err) {
    console.error("Error fetching nearby hotels:", err);
    res.status(500).json({ error: "Failed to fetch nearby hotels" });
  }
}

async function getRestaurants(req, res) {
  try {
    const { district_id, cuisine, search } = req.query;
    const restaurants = await restaurantService.getAllRestaurants({
      district_id: district_id ? parseInt(district_id, 10) : null,
      cuisine,
      search
    });
    res.json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
}

async function getRestaurantDetails(req, res) {
  try {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error("Error fetching restaurant details:", err);
    res.status(500).json({ error: "Failed to fetch restaurant details" });
  }
}

async function getNearbyRestaurants(req, res) {
  try {
    const { lat, lng, radius, limit } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const radiusKm = radius ? parseFloat(radius) : 15;
    const maxResults = limit ? parseInt(limit, 10) : 6;

    const nearby = await restaurantService.getNearbyRestaurants(
      parseFloat(lat),
      parseFloat(lng),
      radiusKm,
      maxResults
    );
    res.json(nearby);
  } catch (err) {
    console.error("Error fetching nearby restaurants:", err);
    res.status(500).json({ error: "Failed to fetch nearby restaurants" });
  }
}

module.exports = {
  getHotels,
  getHotelDetails,
  getNearbyHotels,
  getRestaurants,
  getRestaurantDetails,
  getNearbyRestaurants
};
