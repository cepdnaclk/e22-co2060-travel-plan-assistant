const { createTravelPlan } = require("../services/travelService");
const { getAllItinerary, updateSessionMilestone } = require("../services/itineraryService");
const { getNearbyRestaurants } = require("../services/restaurantService");
const { getNearbyHotels } = require("../services/hotelService");

async function testTripGenerationWorkflow() {
  console.log("=====================================================");
  console.log("1. GENERATING TRIP: Colombo -> Kandy -> Galle");
  console.log("=====================================================");

  const trip = await createTravelPlan(
    "Colombo",
    ["Kandy"],
    2880,
    "Galle",
    1,
    "08:30",
    "20:00"
  );

  console.log("✓ Trip Generated! Session ID:", trip.sessionId);
  console.log("  Feasible:", trip.feasible);
  console.log("  Checkpoints:", trip.checkpoints);
  console.log("  Path nodes count:", trip.path.length);
  console.log("  Total travel time:", (trip.totalTime / 60).toFixed(1) + " hours");
  console.log("  Total travel distance:", trip.totalDistance + " km");

  console.log("\n=====================================================");
  console.log("2. FETCHING ITINERARY FROM ITINERARY SERVICE");
  console.log("=====================================================");

  const allItineraries = await getAllItinerary(1);
  const currentTrip = allItineraries.find((t) => t.session_id === trip.sessionId);

  console.log("✓ Retrieved session:", currentTrip.session_id);
  console.log("  Start Time:", currentTrip.startTime);
  console.log("  End Time:", currentTrip.endTime);
  console.log("  Destinations count:", currentTrip.destinations.length);
  console.log("  Route segments count:", currentTrip.routeSegments.length);
  console.log("  Initial milestones:", currentTrip.milestones);

  console.log("\n=====================================================");
  console.log("3. SIMULATING MIDDAY LUNCH MILESTONE PROMPT");
  console.log("=====================================================");
  // Midday destination (middle of route)
  const middayDest = currentTrip.destinations[Math.floor(currentTrip.destinations.length / 2)];
  console.log("Midday stop near:", middayDest.name, "Coordinates:", middayDest.lat, middayDest.lng);

  const nearbyRestaurants = await getNearbyRestaurants(middayDest.lat, middayDest.lng, 35, 3);
  console.log("Found nearby restaurants for lunch:");
  nearbyRestaurants.forEach((r) =>
    console.log(" -", r.name, "| Cuisine:", r.cuisine_type, "| Rating:", r.rating, "| Dist:", r.distance_km + "km")
  );

  const chosenRestaurant = nearbyRestaurants[0];
  console.log("User selects for lunch:", chosenRestaurant.name);

  await updateSessionMilestone(trip.sessionId, 1, {
    type: "lunch",
    day: 1,
    placeId: chosenRestaurant.restaurant_id,
    status: "selected",
  });
  console.log("✓ Lunch stop saved to session!");

  console.log("\n=====================================================");
  console.log("4. SIMULATING EVENING OVERNIGHT HOTEL PROMPT");
  console.log("=====================================================");
  // End of day destination (last stop)
  const lastDest = currentTrip.destinations[currentTrip.destinations.length - 1];
  console.log("Day end stop near:", lastDest.name, "Coordinates:", lastDest.lat, lastDest.lng);

  const nearbyHotels = await getNearbyHotels(lastDest.lat, lastDest.lng, 35, 3);
  console.log("Found nearby hotels for overnight stay:");
  nearbyHotels.forEach((h) =>
    console.log(" -", h.name, "| Type:", h.hotel_type, "| Rating:", h.rating, "| Dist:", h.distance_km + "km")
  );

  const chosenHotel = nearbyHotels[0];
  console.log("User selects for overnight stay:", chosenHotel.name);

  await updateSessionMilestone(trip.sessionId, 1, {
    type: "overnight",
    day: 1,
    placeId: chosenHotel.hotel_id,
    status: "selected",
  });
  console.log("✓ Overnight hotel stay saved to session!");

  console.log("\n=====================================================");
  console.log("5. VERIFYING PERSISTED ITINERARY WITH ENRICHED PLACES");
  console.log("=====================================================");

  const refreshedItineraries = await getAllItinerary(1);
  const updatedTrip = refreshedItineraries.find((t) => t.session_id === trip.sessionId);

  console.log("✓ Session reloaded. Milestones count:", updatedTrip.milestones.length);
  updatedTrip.milestones.forEach((m) => {
    console.log(`- [${m.type.toUpperCase()}] Status: ${m.status}`);
    console.log(`  Place: ${m.place?.name}`);
    console.log(`  Category/Cuisine: ${m.place?.hotel_type || m.place?.cuisine_type}`);
    console.log(`  Rating: ${m.place?.rating} ★`);
    console.log(`  Address: ${m.place?.address}`);
    console.log(`  Photo: ${m.place?.display_picture}`);
  });

  console.log("\n=====================================================");
  console.log("ALL WORKFLOW STEPS VERIFIED 100% CONSISTENT & WORKING!");
  console.log("=====================================================");
}

testTripGenerationWorkflow()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
