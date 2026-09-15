// tests/testNoHotelsInTripPath.js
require("dotenv").config();
const db = require("../config/db");
const { createTravelPlan } = require("../services/travelService");
const { getAllItinerary, updateSessionMilestone } = require("../services/itineraryService");
const { getNearbyRestaurants } = require("../services/restaurantService");
const { getNearbyHotels } = require("../services/hotelService");

async function testTripExclusion() {
  console.log("================================================================================");
  console.log("  VERIFY NO HOTELS OR RESTAURANTS AS ATTRACTIONS IN TRIP ITINERARY              ");
  console.log("================================================================================\n");

  const testUserId = 1;
  const startPlace = "Colombo";
  const endPlace = "Galle";
  const availableTime = 600;

  console.log(`Generating trip from "${startPlace}" to "${endPlace}"...`);
  const plan = await createTravelPlan(startPlace, [], availableTime, endPlace, testUserId);

  console.log("Path generated node count:", plan.path.length);
  console.log("Stops:", plan.path);

  // Check types of each stop in the generated plan
  const [dbStops] = await db.execute(
    `SELECT destinationID, name, type FROM destinations WHERE name IN (${plan.path.map(() => "?").join(",")})`,
    plan.path
  );

  const nonAttractions = dbStops.filter(s => s.type === "hotel" || s.type === "restaurant");
  if (nonAttractions.length > 0) {
    console.error("❌ FAILED: Found non-attraction destinations in plan.path:", nonAttractions);
    throw new Error("Found hotels or restaurants in travel plan path!");
  } else {
    console.log("✓ PASSED: All generated stops are genuine attractions (0 hotels, 0 restaurants).");
  }

  // Load Itinerary for this session
  const itineraries = await getAllItinerary(testUserId);
  const session = itineraries.find(s => s.session_id === plan.sessionId);

  if (!session) {
    throw new Error(`Session ${plan.sessionId} not found in user itineraries!`);
  }

  const badDestinations = session.destinations.filter(d => d.type === "hotel" || d.type === "restaurant");
  if (badDestinations.length > 0) {
    console.error("❌ FAILED: Found non-attraction destinations in session.destinations:", badDestinations);
    throw new Error("Found hotels or restaurants in session.destinations!");
  } else {
    console.log(`✓ PASSED: session.destinations contains ${session.destinations.length} stops, ALL are attractions.`);
  }

  // Add Lunch, Dinner, and Hotel milestones
  const startStop = session.destinations[0];
  const endStop = session.destinations[session.destinations.length - 1];

  const lunchList = await getNearbyRestaurants(startStop.lat, startStop.lng, 25, 1);
  const dinnerList = await getNearbyRestaurants(endStop.lat, endStop.lng, 25, 1);
  const hotelList = await getNearbyHotels(endStop.lat, endStop.lng, 30, 1);

  if (lunchList.length > 0) {
    await updateSessionMilestone(plan.sessionId, testUserId, {
      type: "lunch",
      day: 1,
      placeId: lunchList[0].restaurant_id,
      status: "selected"
    });
    console.log(`✓ Added Lunch milestone: ${lunchList[0].name}`);
  }

  if (dinnerList.length > 0) {
    await updateSessionMilestone(plan.sessionId, testUserId, {
      type: "dinner",
      day: 1,
      placeId: dinnerList[0].restaurant_id,
      status: "selected"
    });
    console.log(`✓ Added Dinner milestone: ${dinnerList[0].name}`);
  }

  if (hotelList.length > 0) {
    await updateSessionMilestone(plan.sessionId, testUserId, {
      type: "overnight",
      day: 1,
      placeId: hotelList[0].hotel_id,
      status: "selected"
    });
    console.log(`✓ Added Overnight Stay (Hotel) milestone: ${hotelList[0].name}`);
  }

  // Verify reloaded session
  const reloadedItins = await getAllItinerary(testUserId);
  const reloaded = reloadedItins.find(s => s.session_id === plan.sessionId);

  console.log(`Reloaded session milestones (${reloaded.milestones.length}):`);
  reloaded.milestones.forEach(m => {
    console.log(`  - [${m.type.toUpperCase()}]: ${m.place?.name} (${m.status})`);
  });

  const mTypes = reloaded.milestones.map(m => m.type);
  if (!mTypes.includes("lunch") || !mTypes.includes("dinner") || !mTypes.includes("overnight")) {
    throw new Error("Missing expected milestones in reloaded session!");
  }

  console.log("\n================================================================================");
  console.log("  ALL TESTS PASSED: HOTELS & RESTAURANTS CORRECTLY RESTRICTED TO MILESTONES!    ");
  console.log("================================================================================\n");
}

testTripExclusion()
  .then(async () => {
    await db.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await db.end();
    process.exit(1);
  });
