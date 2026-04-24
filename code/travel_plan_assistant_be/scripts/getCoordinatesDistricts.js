// Initial Coord retreiving this only needs to be done once as it stores all coords to district table
const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale",
  "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna",
  "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa",
  "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura",
  "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"
];

(async () => {
  for (const district of districts) {
    try {
      const coords = await getCoordinates(district);
      console.log(`${district} ✅ Lat: ${coords.lat}, Lng: ${coords.lng}`);
    } catch (err) {
      console.error(`${district} ❌ Error: ${err.message}`);
    }
  }
})();

// Comment this after first run