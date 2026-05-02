const express = require("express");
const router = express.Router();
const {
  getItinerary
} = require("../controllers/itineraryController");

router.post("/", getItinerary);

module.exports = router;