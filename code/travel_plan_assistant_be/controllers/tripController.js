const { createTravelPlan } = require("../services/travelService");
const { validateFeasibility } = require("../services/distanceService");

/**
 * Generate a travel plan based on provided parameters
 * POST /api/trips/generate
 * 
 * Request body:
 * {
 *   "startPlace": "Colombo",
 *   "desiredPlaces": ["Kandy", "Nuwara Eliya"],
 *   "availableTime": 5,
 *   "endPlace": "Galle"
 * }
 */
async function generateTripPlan(req, res) {
    try {
        const { startPlace, desiredPlaces = [], availableTime, endPlace } = req.body;

        // Validation
        if (!startPlace) {
            return res.status(400).json({
                error: "Starting location is required",
                code: "MISSING_START_LOCATION"
            });
        }

        if (!endPlace && desiredPlaces.length === 0) {
            return res.status(400).json({
                error: "Either end location or at least one desired location is required",
                code: "MISSING_DESTINATIONS"
            });
        }

        if (!availableTime || availableTime <= 0) {
            return res.status(400).json({
                error: "Available time must be a positive number",
                code: "INVALID_TIME"
            });
        }

        // Generate the travel plan
        const travelPlan = await createTravelPlan(
            startPlace,
            desiredPlaces,
            availableTime,
            endPlace,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Travel plan generated successfully",
            data: travelPlan
        });

    } catch (error) {
        console.error("Error generating trip plan:", error);
        
        res.status(500).json({
            success: false,
            error: error.message || "Failed to generate travel plan",
            code: "TRIP_GENERATION_ERROR"
        });
    }
}

/**
 * Validate feasibility of a travel plan without creating sessions
 * POST /api/trips/check-feasibility
 */
async function checkFeasibility(req, res) {
    try {
        const { startPlace, desiredPlaces = [], availableTime, endPlace } = req.body;

        if (!startPlace) {
            return res.status(400).json({
                error: "Starting location is required",
                code: "MISSING_START_LOCATION"
            });
        }

        if (!availableTime || availableTime <= 0) {
            return res.status(400).json({
                error: "Available time must be a positive number",
                code: "INVALID_TIME"
            });
        }

        const result = await validateFeasibility(
            startPlace,
            desiredPlaces,
            availableTime,
            endPlace
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Error checking trip feasibility:", error);

        res.status(500).json({
            success: false,
            error: error.message || "Failed to check trip feasibility",
            code: "FEASIBILITY_CHECK_ERROR"
        });
    }
}

module.exports = {
    generateTripPlan,
    checkFeasibility
};
