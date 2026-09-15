const express = require("express");
const router = express.Router();
const {
  getItinerary,
  saveMilestone
} = require("../controllers/itineraryController");

router.post("/", getItinerary);
router.put("/:sessionId/milestone", saveMilestone);
router.post("/:sessionId/milestone", saveMilestone);

module.exports = router;