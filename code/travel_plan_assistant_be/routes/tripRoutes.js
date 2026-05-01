const express = require("express");
const router = express.Router();
const { generateTripPlan } = require("../controllers/tripController");

/**
 * POST /api/trips/generate
 * Generate a new travel plan based on start location, desired locations, available time, and end location
 */
router.post("/generate", generateTripPlan);

module.exports = router;
