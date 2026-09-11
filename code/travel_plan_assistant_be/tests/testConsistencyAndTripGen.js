// tests/testConsistencyAndTripGen.js
require("dotenv").config();
const db = require("../config/db");
const { saveDestination } = require("../helpers/saveDestination");
const { findByID, getAllDestinations } = require("../services/destinationService");
const { getNearbyHotels } = require("../services/hotelService");
const { getNearbyRestaurants } = require("../services/restaurantService");
const { createTravelPlan } = require("../services/travelService");
const { getAllItinerary, updateSessionMilestone } = require("../services/itineraryService");

async function runVerification() {
  console.log("================================================================================");
  console.log("  COMPREHENSIVE SYSTEM VERIFICATION: PLACE INSERTION, NEARBY & TRIP GENERATION  ");
  console.log("================================================================================\n");

  // -------------------------------------------------------------------------
  // PART 1: TEST PLACE INSERTION & NEARBY POPULATION CONSISTENCY
  // -------------------------------------------------------------------------
  console.log(">>> [STEP 1] Testing Consistent Insertion of a New Place with populateNearby...");
  
  // Choose a real landmark in Sri Lanka not yet in DB or test place
  // Let's test a distinct place: "Seetha Amman Temple" (Nuwara Eliya)
  const testPlaceName = "Seetha Amman Temple";
  console.log(`Checking if "${testPlaceName}" is in DB...`);
  
  // Cleanup if already existing from prior test to verify full insert cycle
  const [existingRows] = await db.execute("SELECT destinationID FROM destinations WHERE name LIKE ? LIMIT 1", [`%${testPlaceName}%`]);
  if (existingRows.length > 0) {
    const existingId = existingRows[0].destinationID;
    console.log(`Found prior test record (ID: ${existingId}). Cleaning up for fresh verification...`);
    await db.execute("DELETE FROM nearby_destinations WHERE source_id = ? OR destination_id = ?", [existingId, existingId]);
    await db.execute("DELETE FROM hotels WHERE destination_id = ?", [existingId]);
    await db.execute("DELETE FROM restaurants WHERE destination_id = ?", [existingId]);
    await db.execute("DELETE FROM destinations WHERE destinationID = ?", [existingId]);
    console.log("✓ Prior test record cleaned up.");
  }

  console.log(`Calling saveDestination("${testPlaceName}")...`);
  const savedPlace = await saveDestination(testPlaceName);
  console.log("Result of saveDestination:", savedPlace);

  if (!savedPlace || (!savedPlace.id && !savedPlace.destinationID)) {
    throw new Error(`Failed to save destination "${testPlaceName}"`);
  }

  const destId = savedPlace.id || savedPlace.destinationID;

  // Verify destinations table
  console.log(`\nVerifying 'destinations' record for ID ${destId}...`);
  const [destRows] = await db.execute(
    "SELECT destinationID, name, lat, lng, rating, type, district_id, display_picture, (description IS NOT NULL) as has_desc, (photos IS NOT NULL) as has_photos FROM destinations WHERE destinationID = ?",
    [destId]
  );
  console.table(destRows);

  if (destRows.length === 0) {
    throw new Error(`Destination ID ${destId} was not found in destinations table!`);
  }
  const destRecord = destRows[0];
  console.log(`✓ Destination inserted successfully:
    - ID: ${destRecord.destinationID}
    - Name: ${destRecord.name}
    - Lat/Lng: ${destRecord.lat}, ${destRecord.lng}
    - Type: ${destRecord.type} (Expected: attraction)
    - District ID: ${destRecord.district_id}
    - Display Picture: ${destRecord.display_picture || "None"}
  `);

  // Verify nearby_destinations table
  console.log(`Verifying 'nearby_destinations' for ID ${destId}...`);
  const [nearbyRows] = await db.execute(
    `SELECT n.nearby_id, n.source_id, n.destination_id, n.distance, n.duration,
            d1.name as src_name, d2.name as dst_name
     FROM nearby_destinations n
     JOIN destinations d1 ON n.source_id = d1.destinationID
     JOIN destinations d2 ON n.destination_id = d2.destinationID
     WHERE n.source_id = ? OR n.destination_id = ?`,
    [destId, destId]
  );
  console.table(nearbyRows);

  if (nearbyRows.length === 0) {
    console.warn("⚠ Warning: No nearby routes inserted (may be far from other destinations or quota limit).");
  } else {
    console.log(`✓ populateNearby successfully created ${nearbyRows.length} route segments for destination ${destId}!`);
  }

  // Verify findByID unified query
  console.log(`\nVerifying findByID(${destId}) unified lookup...`);
  const fullDest = await findByID(destId);
  console.log("findByID result:", {
    id: fullDest.id,
    name: fullDest.name,
    type: fullDest.type,
    rating: fullDest.rating,
    district_name: fullDest.district_name,
    display_picture: fullDest.display_picture,
  });

  // -------------------------------------------------------------------------
  // PART 2: TEST TRIP GENERATION WITH NEW START/END TIMES & MILESTONES
  // -------------------------------------------------------------------------
  console.log("\n>>> [STEP 2] Testing Trip Generation with Custom Start/End Times...");
  
  // Use a test user ID (e.g. 1 - System Admin)
  const testUserId = 1;
  const startPlace = "Colombo";
  const desiredPlaces = ["Kandy"];
  const endPlace = "Galle";
  const availableTime = 480; // 8 hours available
  const startTime = "08:30";
  const endTime = "20:00";

  console.log(`Generating trip:
    Start: ${startPlace}
    Desired: ${JSON.stringify(desiredPlaces)}
    End: ${endPlace}
    Time Budget: ${availableTime} minutes
    Daily Start Time: ${startTime}
    Daily End Time: ${endTime}
    User ID: ${testUserId}
  `);

  const planResult = await createTravelPlan(
    startPlace,
    desiredPlaces,
    availableTime,
    endPlace,
    testUserId,
    startTime,
    endTime
  );

  console.log("\nTrip Plan Result:");
  console.log({
    sessionId: planResult.sessionId,
    feasible: planResult.feasible,
    totalTime: planResult.totalTime + " mins",
    totalDistance: planResult.totalDistance + " km",
    checkpoints: planResult.checkpoints,
    pathNodeCount: planResult.path.length
  });

  const sessionId = planResult.sessionId;

  // -------------------------------------------------------------------------
  // PART 3: TEST ITINERARY TIMELINE & MILESTONE RECOMMENDATION
  // -------------------------------------------------------------------------
  console.log("\n>>> [STEP 3] Fetching Initial Itinerary and Generating Milestones...");
  const itineraries = await getAllItinerary(testUserId);
  const sessionItinerary = itineraries.find(s => s.session_id === sessionId);

  if (!sessionItinerary) {
    throw new Error(`Session ${sessionId} not found in user itineraries!`);
  }

  console.log(`Itinerary loaded for Session ${sessionId}:`);
  console.log(`- Destinations count: ${sessionItinerary.destinations.length}`);
  console.log(`- Route segments count: ${sessionItinerary.routeSegments.length}`);
  console.log(`- Start time: ${sessionItinerary.startTime}, End time: ${sessionItinerary.endTime}`);
  console.log(`- Milestones: ${sessionItinerary.milestones.length}`);

  // Print destinations in order
  console.log("\nOrdered stops in itinerary:");
  sessionItinerary.destinations.forEach((d, idx) => {
    console.log(`  ${idx + 1}. [${d.type.toUpperCase()}] ${d.name} (${d.district_name})`);
  });

  // Print route segments
  console.log("\nRoute segments between stops:");
  sessionItinerary.routeSegments.forEach((seg, idx) => {
    console.log(`  Leg ${idx + 1}: ${seg.distance} (${seg.duration}) via ${seg.transport}`);
  });

  // -------------------------------------------------------------------------
  // PART 4: TEST LUNCH MILESTONE RECOMMENDATION (Midday Search & Selection)
  // -------------------------------------------------------------------------
  console.log("\n>>> [STEP 4] Testing Lunch Milestone: Proximity Search & Selection...");
  // Pick the midday stop (e.g. Kandy stop)
  const middayStop = sessionItinerary.destinations[Math.floor(sessionItinerary.destinations.length / 2)];
  console.log(`Midday stop for lunch prompt: "${middayStop.name}" at coords (${middayStop.lat}, ${middayStop.lng})`);

  console.log(`Searching nearby restaurants within 20 km of ${middayStop.name}...`);
  const nearbyRestaurants = await getNearbyRestaurants(middayStop.lat, middayStop.lng, 20, 5);
  console.log(`Found ${nearbyRestaurants.length} nearby restaurants:`);
  nearbyRestaurants.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} | ${r.cuisine_type || "Cuisine"} | ⭐ ${r.rating || "N/A"} | ${r.distance_km} km away`);
  });

  if (nearbyRestaurants.length === 0) {
    throw new Error("No nearby restaurants found for midday stop!");
  }

  const selectedRestaurant = nearbyRestaurants[0];
  console.log(`\nUser selects Restaurant for Lunch: "${selectedRestaurant.name}" (ID: ${selectedRestaurant.restaurant_id})`);

  const lunchMilestoneUpdate = await updateSessionMilestone(sessionId, testUserId, {
    type: "lunch",
    day: 1,
    placeId: selectedRestaurant.restaurant_id,
    status: "selected"
  });

  console.log("Lunch milestone updated in session:", {
    type: lunchMilestoneUpdate.type,
    day: lunchMilestoneUpdate.day,
    status: lunchMilestoneUpdate.status,
    restaurantName: lunchMilestoneUpdate.place?.name,
    restaurantAddress: lunchMilestoneUpdate.place?.address,
    cuisine: lunchMilestoneUpdate.place?.cuisine_type
  });

  // -------------------------------------------------------------------------
  // PART 5: TEST OVERNIGHT STAY MILESTONE (Evening Search & Selection)
  // -------------------------------------------------------------------------
  console.log("\n>>> [STEP 5] Testing Overnight Stay Milestone: Proximity Search & Selection...");
  // Pick evening stop (last destination: Galle)
  const eveningStop = sessionItinerary.destinations[sessionItinerary.destinations.length - 1];
  console.log(`Evening stop for hotel stay prompt: "${eveningStop.name}" at coords (${eveningStop.lat}, ${eveningStop.lng})`);

  console.log(`Searching nearby hotels within 30 km of ${eveningStop.name}...`);
  const nearbyHotels = await getNearbyHotels(eveningStop.lat, eveningStop.lng, 30, 5);
  console.log(`Found ${nearbyHotels.length} nearby hotels:`);
  nearbyHotels.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h.name} | ${h.hotel_type || "Hotel"} | ⭐ ${h.rating || "N/A"} | ${h.distance_km} km away`);
  });

  if (nearbyHotels.length === 0) {
    throw new Error("No nearby hotels found for evening stop!");
  }

  const selectedHotel = nearbyHotels[0];
  console.log(`\nUser selects Hotel for Overnight Stay: "${selectedHotel.name}" (ID: ${selectedHotel.hotel_id})`);

  const hotelMilestoneUpdate = await updateSessionMilestone(sessionId, testUserId, {
    type: "overnight",
    day: 1,
    placeId: selectedHotel.hotel_id,
    status: "selected"
  });

  console.log("Overnight milestone updated in session:", {
    type: hotelMilestoneUpdate.type,
    day: hotelMilestoneUpdate.day,
    status: hotelMilestoneUpdate.status,
    hotelName: hotelMilestoneUpdate.place?.name,
    hotelAddress: hotelMilestoneUpdate.place?.address,
    hotelType: hotelMilestoneUpdate.place?.hotel_type
  });

  // -------------------------------------------------------------------------
  // PART 6: VERIFY PERSISTENCE UPON RELOAD
  // -------------------------------------------------------------------------
  console.log("\n>>> [STEP 6] Verifying Persistence Across Reload...");
  const reloadedItineraries = await getAllItinerary(testUserId);
  const reloadedSession = reloadedItineraries.find(s => s.session_id === sessionId);

  console.log(`Session ${sessionId} reloaded:`);
  console.log(`- Milestones count: ${reloadedSession.milestones.length}`);
  reloadedSession.milestones.forEach(m => {
    console.log(`  • Milestone [${m.type.toUpperCase()}] - Status: ${m.status}`);
    console.log(`    Place: ${m.place?.name} (${m.place?.address || "Address N/A"})`);
    console.log(`    Rating: ⭐ ${m.place?.rating || "N/A"}`);
  });

  const hasLunch = reloadedSession.milestones.some(m => m.type === "lunch" && m.restaurantId === selectedRestaurant.restaurant_id);
  const hasHotel = reloadedSession.milestones.some(m => m.type === "overnight" && m.hotelId === selectedHotel.hotel_id);

  if (!hasLunch || !hasHotel) {
    throw new Error("Failed persistence verification: Milestones were not correctly retrieved from DB!");
  }

  console.log("\n================================================================================");
  console.log("  ALL CHECKS PASSED: END-TO-END SYSTEM CONSISTENCY & TRIP PLANNER VERIFIED!     ");
  console.log("================================================================================");
}

runVerification()
  .then(async () => {
    await db.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("\n❌ VERIFICATION FAILED:", err);
    await db.end();
    process.exit(1);
  });
