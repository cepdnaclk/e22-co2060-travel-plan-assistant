const express = require("express");
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getTrendingDestinations
} = require("../controllers/destinationController");

router.get("/trending", getTrendingDestinations);
router.get("/", getDestinations);
router.get("/:id", getDestinationById);

module.exports = router;
