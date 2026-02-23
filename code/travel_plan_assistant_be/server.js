const express = require("express");
const cors = require("cors");

const { getCoordinates } = require("./services/routeService");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const routeService = require("./routes/routeService");
app.use("/api", routeService);

app.get("/", (req, res) => {
    res.send("Travel Plan Assistant API is running...");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
