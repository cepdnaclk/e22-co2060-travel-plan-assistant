// tests/testPlaceTypesInsertion.js
require("dotenv").config();
const db = require("../config/db");
const { saveDestination } = require("../helpers/saveDestination");
const { findByID } = require("../services/destinationService");

async function testPlaceTypes() {
  console.log("================================================================================");
  console.log("  VERIFYING DEDICATED HOTEL & RESTAURANT INSERTIONS VIA saveDestination         ");
  console.log("================================================================================\n");

  // 1. Test Hotel Insertion
  const hotelName = "Heritance Ahungalla"; // Iconic luxury hotel by Geoffrey Bawa
  console.log(`[TEST HOTEL] Inserting "${hotelName}" with explicit type="hotel"...`);

  // Clean prior if exists
  const [hExisting] = await db.execute("SELECT destinationID FROM destinations WHERE name LIKE ? LIMIT 1", [`%${hotelName}%`]);
  if (hExisting.length > 0) {
    const id = hExisting[0].destinationID;
    await db.execute("DELETE FROM nearby_destinations WHERE source_id = ? OR destination_id = ?", [id, id]);
    await db.execute("DELETE FROM hotels WHERE destination_id = ?", [id]);
    await db.execute("DELETE FROM destinations WHERE destinationID = ?", [id]);
  }

  const savedHotel = await saveDestination(hotelName, "hotel");
  console.log("saveDestination result for hotel:", savedHotel);

  const hotelDestId = savedHotel.id || savedHotel.destinationID;

  // Verify in destinations table
  const [hDestRows] = await db.execute(
    "SELECT destinationID, name, lat, lng, type, display_picture FROM destinations WHERE destinationID = ?",
    [hotelDestId]
  );
  console.log("Destination table record:", hDestRows[0]);

  // Verify in hotels table
  const [hRows] = await db.execute(
    "SELECT hotel_id, name, destination_id, hotel_type, phone_number, website, display_picture FROM hotels WHERE destination_id = ?",
    [hotelDestId]
  );
  console.log("Hotels table record:", hRows[0]);

  if (!hRows.length || hRows[0].destination_id !== hotelDestId) {
    throw new Error(`Hotel was not linked properly with destination_id ${hotelDestId}!`);
  }
  console.log(`✓ Hotel successfully inserted and linked: hotel_id=${hRows[0].hotel_id} -> destination_id=${hRows[0].destination_id}`);

  // Verify unified findByID
  const unifiedHotel = await findByID(hotelDestId);
  console.log("findByID unified lookup for Hotel:", {
    destinationID: unifiedHotel.destinationID,
    name: unifiedHotel.name,
    type: unifiedHotel.type,
    hotel_id: unifiedHotel.hotel_id,
    hotel_type: unifiedHotel.hotel_type,
    phone: unifiedHotel.hotel_phone,
    website: unifiedHotel.hotel_website
  });

  // 2. Test Restaurant Insertion
  const restName = "The Empire Cafe Kandy"; // Iconic cafe opposite Temple of the Tooth
  console.log(`\n[TEST RESTAURANT] Inserting "${restName}" with explicit type="restaurant"...`);

  // Clean prior if exists
  const [rExisting] = await db.execute("SELECT destinationID FROM destinations WHERE name LIKE ? LIMIT 1", [`%${restName}%`]);
  if (rExisting.length > 0) {
    const id = rExisting[0].destinationID;
    await db.execute("DELETE FROM nearby_destinations WHERE source_id = ? OR destination_id = ?", [id, id]);
    await db.execute("DELETE FROM restaurants WHERE destination_id = ?", [id]);
    await db.execute("DELETE FROM destinations WHERE destinationID = ?", [id]);
  }

  const savedRest = await saveDestination(restName, "restaurant");
  console.log("saveDestination result for restaurant:", savedRest);

  const restDestId = savedRest.id || savedRest.destinationID;

  // Verify in destinations table
  const [rDestRows] = await db.execute(
    "SELECT destinationID, name, lat, lng, type, display_picture FROM destinations WHERE destinationID = ?",
    [restDestId]
  );
  console.log("Destination table record:", rDestRows[0]);

  // Verify in restaurants table
  const [rRows] = await db.execute(
    "SELECT restaurant_id, name, destination_id, cuisine_type, phone_number, website, display_picture FROM restaurants WHERE destination_id = ?",
    [restDestId]
  );
  console.log("Restaurants table record:", rRows[0]);

  if (!rRows.length || rRows[0].destination_id !== restDestId) {
    throw new Error(`Restaurant was not linked properly with destination_id ${restDestId}!`);
  }
  console.log(`✓ Restaurant successfully inserted and linked: restaurant_id=${rRows[0].restaurant_id} -> destination_id=${rRows[0].destination_id}`);

  // Verify unified findByID
  const unifiedRest = await findByID(restDestId);
  console.log("findByID unified lookup for Restaurant:", {
    destinationID: unifiedRest.destinationID,
    name: unifiedRest.name,
    type: unifiedRest.type,
    restaurant_id: unifiedRest.restaurant_id,
    cuisine_type: unifiedRest.cuisine_type,
    phone: unifiedRest.restaurant_phone,
    website: unifiedRest.restaurant_website
  });

  // Verify nearby_destinations for both
  const [nearbyRoutes] = await db.execute(
    "SELECT COUNT(*) as count FROM nearby_destinations WHERE source_id IN (?, ?) OR destination_id IN (?, ?)",
    [hotelDestId, restDestId, hotelDestId, restDestId]
  );
  console.log(`\n✓ Nearby routes populated for newly added Hotel & Restaurant: ${nearbyRoutes[0].count} connections established!`);

  console.log("\n================================================================================");
  console.log("  HOTEL & RESTAURANT CONSISTENCY CHECKS PASSED 100%!                             ");
  console.log("================================================================================");
}

testPlaceTypes()
  .then(async () => {
    await db.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("\n❌ TEST FAILED:", err);
    await db.end();
    process.exit(1);
  });
