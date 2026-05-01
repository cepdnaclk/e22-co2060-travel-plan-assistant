const express = require("express");
const cors = require("cors");

const { getCoordinates } = require("./services/routeService");
require("dotenv").config();

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

// const routeService = require("./routes/routeService");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");

app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);

// app.use("/api", routeService);

app.get("/", (req, res) => {
  res.send("Travel Plan Assistant API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
