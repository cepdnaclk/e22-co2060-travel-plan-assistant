const express = require("express");
const router = express.Router();
const {
  getItinerary,
  saveMilestone,
  replacePlace,
  removePlace,
  updatePlaceDuration
} = require("../controllers/itineraryController");

router.post("/", getItinerary);
router.put("/:sessionId/milestone", saveMilestone);
router.post("/:sessionId/milestone", saveMilestone);
router.put("/:sessionId/replace", replacePlace);
router.delete("/:sessionId/place/:placeId", removePlace);
router.put("/:sessionId/place/:placeId/duration", updatePlaceDuration);

module.exports = router;