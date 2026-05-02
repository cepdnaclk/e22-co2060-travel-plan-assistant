const destinationService = require("../services/itineraryService");

exports.getItinerary = async (req, res) => {
  const user_id = req.body.user_id;

  try {
    const itinerary = await destinationService.getAllItinerary(user_id);
    res.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
};
