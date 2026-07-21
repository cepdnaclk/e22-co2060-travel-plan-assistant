const express = require("express");
const router = express.Router();
const { generateTripPlan, checkFeasibility } = require("../controllers/tripController");

/**
 * POST /api/trips/generate
 * Generate a new travel plan based on start location, desired locations, available time, and end location
 */
router.post("/generate", generateTripPlan);

/**
 * POST /api/trips/check-feasibility
 * Check feasibility of a proposed travel plan
 */
router.post("/check-feasibility", checkFeasibility);

module.exports = router;
