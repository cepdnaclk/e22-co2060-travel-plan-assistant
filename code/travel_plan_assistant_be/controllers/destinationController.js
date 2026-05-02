const destinationService = require("../services/destinationService");

exports.getDestinations = async (req, res) => {
  try {
    const destinations = await destinationService.getAllDestinations();
    res.json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
};

exports.getDestinationById = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await destinationService.findByID(id);

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json(destination);
  } catch (error) {
    console.error("Error fetching destination:", error);
    res.status(500).json({ error: "Failed to fetch destination" });
  }
};

exports.getTrendingDestinations = async (req, res) => {
  try {
    const destinations = await destinationService.getTrendingDestinations();
    res.json(destinations);
  } catch (error) {
    console.error("Error fetching trending destinations:", error);
    res.status(500).json({ error: "Failed to fetch trending destinations" });
  }
};
