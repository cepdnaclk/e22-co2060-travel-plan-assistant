require("dotenv").config();

const { insertDestination } = require("../services/destinationService");

(async () => {
    try {
        const id = await insertDestination({
            district_id: 10,
            name: "Peradeniya Test",
            lat: 7.2622,
            lng: 80.5841,
            rating: 4.6,
            tag: "garden"
        });

        console.log("INSERTED ID:", id);
    } catch (error) {
        console.error("FAILED:", error);
    }

    process.exit();
})();