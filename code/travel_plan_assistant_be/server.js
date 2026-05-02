const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

const { getCoordinates } = require("./services/routeService");
require("dotenv").config();

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

// const routeService = require("./routes/routeService");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/api/itinerary", itineraryRoutes);

app.post("/api/directions", async (req, res) => {
  const { destinations } = req.body;

  const origin = `${destinations[0].lat},${destinations[0].lng}`;
  const destination = `${destinations.at(-1).lat},${destinations.at(-1).lng}`;

  const waypoints = destinations
    .slice(1, -1)
    .map((d) => `${d.lat},${d.lng}`)
    .join("|");

  const url = "https://maps.googleapis.com/maps/api/directions/json";

  const response = await axios.get(url, {
    params: {
      origin,
      destination,
      waypoints: waypoints ? `optimize:false|${waypoints}` : undefined,
      key: process.env.GOOGLE_API_KEY,
    },
  });

  res.json(response.data);
});

// app.use("/api", routeService);

app.get("/", (req, res) => {
  res.send("Travel Plan Assistant API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
