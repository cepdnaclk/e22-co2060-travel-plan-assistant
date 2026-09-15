const destinationService = require("../services/destinationService");

exports.getDestinations = async (req, res) => {
  try {
    const { type } = req.query;
    const destinations = await destinationService.getAllDestinations({ type });
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

exports.getNearbyDestinations = async (req, res) => {
  const { id } = req.params;
  const { radius, limit, exclude } = req.query;

  try {
    let excludeIds = [];
    if (exclude) {
      if (Array.isArray(exclude)) {
        excludeIds = exclude.map((x) => parseInt(x, 10)).filter((n) => !isNaN(n));
      } else if (typeof exclude === "string") {
        excludeIds = exclude
          .split(",")
          .map((x) => parseInt(x.trim(), 10))
          .filter((n) => !isNaN(n));
      }
    }

    const radiusKm = radius ? parseFloat(radius) : 30;
    const maxLimit = limit ? parseInt(limit, 10) : 8;

    const nearby = await destinationService.getNearbyAttractions(id, {
      radiusKm,
      limit: maxLimit,
      excludeIds,
    });

    res.json(nearby);
  } catch (error) {
    console.error("Error fetching nearby destinations:", error);
    res.status(500).json({ error: error.message || "Failed to fetch nearby destinations" });
  }
};
