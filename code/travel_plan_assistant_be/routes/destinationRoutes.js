const express = require("express");
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getTrendingDestinations,
  getNearbyDestinations,
} = require("../controllers/destinationController");

router.get("/trending", getTrendingDestinations);
router.get("/:id/nearby", getNearbyDestinations);
router.get("/", getDestinations);
router.get("/:id", getDestinationById);

module.exports = router;
