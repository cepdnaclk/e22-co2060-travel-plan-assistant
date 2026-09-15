const itineraryService = require("../services/itineraryService");

exports.getItinerary = async (req, res) => {
  const user_id = req.user.userId;

  try {
    const itinerary = await itineraryService.getAllItinerary(user_id);
    res.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
};

exports.saveMilestone = async (req, res) => {
  const userId = req.user.userId;
  const sessionId = parseInt(req.params.sessionId, 10);
  const { type, day, placeId, status } = req.body;

  if (!type || !["lunch", "dinner", "overnight"].includes(type)) {
    return res.status(400).json({ error: "Milestone type is required (lunch, dinner, or overnight)" });
  }

  try {
    const updatedMilestone = await itineraryService.updateSessionMilestone(sessionId, userId, {
      type,
      day: day ? parseInt(day, 10) : 1,
      placeId: placeId ? parseInt(placeId, 10) : null,
      status: status || (placeId ? "selected" : "ignored")
    });

    res.json({ success: true, milestone: updatedMilestone });
  } catch (error) {
    console.error("Error saving milestone:", error);
    res.status(500).json({ error: error.message || "Failed to save milestone" });
  }
};

exports.replacePlace = async (req, res) => {
  const userId = req.user.userId;
  const sessionId = parseInt(req.params.sessionId, 10);
  const { oldPlaceId, newPlaceId } = req.body;

  if (!oldPlaceId || !newPlaceId) {
    return res.status(400).json({ error: "oldPlaceId and newPlaceId are required" });
  }

  try {
    const updatedTrip = await itineraryService.replaceSessionDestination(
      sessionId,
      userId,
      oldPlaceId,
      newPlaceId
    );
    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error("Error replacing place:", error);
    res.status(500).json({ error: error.message || "Failed to replace place" });
  }
};

exports.removePlace = async (req, res) => {
  const userId = req.user.userId;
  const sessionId = parseInt(req.params.sessionId, 10);
  const placeId = parseInt(req.params.placeId, 10);

  if (!placeId) {
    return res.status(400).json({ error: "Valid placeId is required" });
  }

  try {
    const updatedTrip = await itineraryService.removeSessionDestination(
      sessionId,
      userId,
      placeId
    );
    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error("Error removing place:", error);
    res.status(500).json({ error: error.message || "Failed to remove place" });
  }
};

exports.updatePlaceDuration = async (req, res) => {
  const userId = req.user.userId;
  const sessionId = parseInt(req.params.sessionId, 10);
  const placeId = parseInt(req.params.placeId, 10);
  const { duration } = req.body;

  if (!placeId || !duration) {
    return res.status(400).json({ error: "Valid placeId and duration (in minutes) are required" });
  }

  try {
    const updatedTrip = await itineraryService.updateSessionPlaceDuration(
      sessionId,
      userId,
      placeId,
      duration
    );
    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error("Error updating place duration:", error);
    res.status(500).json({ error: error.message || "Failed to update place duration" });
  }
};
