const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");

// Hotels
router.get("/hotels/nearby", placeController.getNearbyHotels);
router.get("/hotels/:id", placeController.getHotelDetails);
router.get("/hotels", placeController.getHotels);

// Restaurants
router.get("/restaurants/nearby", placeController.getNearbyRestaurants);
router.get("/restaurants/:id", placeController.getRestaurantDetails);
router.get("/restaurants", placeController.getRestaurants);

module.exports = router;
