const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { saveDestination } = require("../helpers/saveDestination");
const { findByName } = require("../services/destinationService");
const { sleep } = require("../helpers/safeAPI");

async function populateFromJson() {
    console.log("==================================================");
    console.log("Starting Population from JSON Script (Batch Mode)...");
    console.log("==================================================");

    const args = process.argv.slice(2);
    const startIndex = args[0] ? parseInt(args[0], 10) : 0;
    const batchSize = args[1] ? parseInt(args[1], 10) : 50;
    const endIndex = startIndex + batchSize;

    const jsonPath = path.join(__dirname, "../../../Sri_Lanka_Districts_Hotels_Restaurants.json");
    
    if (!fs.existsSync(jsonPath)) {
        console.error(`JSON file not found at: ${jsonPath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(fileContent);
    
    let allPlaces = [];
    
    if (data.districts) {
        for (const district of data.districts) {
            if (district.establishments) {
                for (const est of district.establishments) {
                    allPlaces.push({
                        name: est.name,
                        type: est.type ? est.type.toLowerCase() : null
                    });
                }
            }
        }
    }
    
    console.log(`Total places in JSON: ${allPlaces.length}`);
    console.log(`Batch Parameters: Start=${startIndex}, BatchSize=${batchSize}, End=${endIndex}`);
    
    const toProcess = allPlaces.slice(startIndex, endIndex);
    console.log(`Processing ${toProcess.length} items in this run...`);

    const successful = [];
    const failed = [];
    let apiHits = 0;
    let skipped = 0;

    for (let i = 0; i < toProcess.length; i++) {
        const place = toProcess[i];
        const globalIndex = startIndex + i + 1;
        console.log(`\n[${globalIndex}/${allPlaces.length}] Processing: ${place.name} (Type: ${place.type})`);

        try {
            // Check if already in DB to avoid unnecessary API calls
            const existing = await findByName(place.name);
            if (existing) {
                skipped++;
                console.log(`✓ Skipped: ${place.name} is already in the database.`);
                continue;
            }

            apiHits++;
            const result = await saveDestination(place.name, place.type);
            successful.push({ input: place.name, result });
            console.log(`✓ Successfully inserted: ${place.name}`);
            
            // Throttle to respect Google API rate limits (1.5 seconds)
            await sleep(1500);
        } catch (error) {
            failed.push({ input: place.name, error: error.message });
            console.log(`✗ Failed: ${place.name} -> ${error.message}`);
        }
    }

    console.log("\n==================================================");
    console.log("              BATCH EXECUTION SUMMARY             ");
    console.log("==================================================");
    console.log(`Total Attempted   : ${toProcess.length}`);
    console.log(`Skipped (in DB)   : ${skipped}`);
    console.log(`API Calls Made    : ${apiHits}`);
    console.log(`Successful Inserts: ${successful.length}`);
    console.log(`Failed            : ${failed.length}`);

    if (failed.length > 0) {
        console.log("\n===== FAILED PLACES =====");
        failed.forEach(item => console.log(`${item.input} - ${item.error}`));
    }
    
    console.log("\nBatch completed.");
    console.log(`Next batch command: node scripts/populateFromJson.js ${endIndex} ${batchSize}`);
}

if (require.main === module) {
    populateFromJson()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Fatal error during population:", err);
            process.exit(1);
        });
}
