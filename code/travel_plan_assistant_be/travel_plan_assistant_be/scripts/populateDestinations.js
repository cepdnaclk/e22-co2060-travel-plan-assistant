const { saveDestination } = require("../helpers/saveDestination");
require("dotenv").config();
const { sleep } = require("../helpers/safeAPI");

const places = [
    "Nayaru Beach",
    "Mullaitivu Town Beach Park",
    "Alampil Mangrove Area",
    "Kokkilai Coastal Belt",
    "Mullivaikkal Memorial Area",
    "Karunattukerni Area",
    "Gregory Lake",
    "Horton Plains National Park",
    "World’s End",
    "Mini World’s End",
    "Hakgala Botanical Garden",
    "Victoria Park Nuwara Eliya",
    "Lover’s Leap Waterfall",
    "Ramboda Falls",
    "Devon Falls",
    "St. Clair’s Falls",
    "Moon Plains/ Sandathenna",
    "Galway’s Land National Park",
    "Seetha Amman kovil",
    "Single Tree Hill",
    "Ambewela Farm",
    "Labookellie Tea Centre",
    "Bomburu Ella Falls",
    "Pidurutalagala Mountain",
    "Kande Ela Reservoir",
    "Blackpool Bridge",
    "Nanu Oya",
    "Strawberry Farms Nuwara Eliya",
    "Shanthipura Viewpoint",
    "Polonnaruwa Ancient City",
    "Gal Vihara",
    "Parakrama Samudraya",
    "Rankoth Vehera",
    "Vatadage",
    "Lankatilaka Image House",
    "Tivanka Image House",
    "Kiri Vehera",
    "Nelum Pokuna",
    "Minneriya National Park",
    "Kaudulla National Park",
    "Girithale Tank",
    "Medirigiriya Vatadage",
    "Somawathiya Chaitya",
    "Angammedilla National Park",
    "Demala Maha Seya",
    "Pabalu Vehera",
    "Siva Devalaya No.1",
    "Siva Devalaya No.2",
    "Royal Palace of King Parakramabahu",
    "King Nissanka malla Audience Hall",
    "Kumara Pokuna",
    "Polonnaruwa Museum",
    "Wilpattu National Park",
    "Kalpitiya Beach",
    "Kalpitiya Lagoon",
    "Bar Reef Marine Sanctuary",
    "Dutch Fort Kalpitiya",
    "St. Anne’s Shrine Talawila",
    "Anawilundawa Wetland Sanctuary",
    "Puttalam Lagoon",
    "Baththalangunduwa Island",
    "Alankuda Beach",
    "Norochcholai Beach",
    "Mampuri Island",
    "Sinnapadu Beach",
    "Puttalam Salt Pans",
    "Kudawa Beach",
    "Kandakuliya Beach",
    "Talawila Beach",
    "Chilaw Beach",
    "Munneswaram Kovil",
    "Deduru Oya",
    "Iranawila Beach",
    "Dutch Canal Puttalam",
    "Holy Cross National Shrine Marawila",
    "Sinharaja Forest Reserve",
    "Udawalawe National Park (border access)",
    "Adam’s Peak (Sri Pada)",
    "Bopath Ella",
    "Kirindi Ella",
    "Katugas Ella Falls",
    "Diyawini Ella",
    "Waulpane Cave",
    "Ratnapura Gem Mines",
    "Batadombalena Cave",
    "Kuragala Ancient Site",
    "Rajawaka Falls",
    "Belihuloya",
    "Horton Plains (access side)",
    "Saman Devalaya",
    "Nonpareil Estate",
    "Bambarakanda Falls (nearby access)",
    "Surathali Ella",
    "Lanka Ella (Belihuloya)",
    "Galagama Falls",
    "Kalawana Forest Area",
    "Pelmadulla Area",
    "Balangoda Scenic Area",
    "Rakwana Mountain Area",
    "Deniyaya (border rainforest access)",
    "Nilaveli Beach",
    "Uppuveli Beach",
    "Pigeon Island National Park",
    "Koneswaram Temple",
    "Fort Frederick",
    "Marble Beach",
    "Kanniya Hot Water Wells",
    "Trincomalee Harbour",
    "Lovers Leap, Trinco",
    "Swami Rock",
    "Velgam Vehera",
    "Seruwawila Mangala Raja Maha Viharaya",
    "Kuchchaveli Beach",
    "Coral Cove",
    "Pulmoddai Beach",
    "Foul Point Lighthouse- Sampur",
    "Dutch Bay Beach",
    "Back Bay Beach",
    "Trincomalee War Cemetery",
    "China Bay Beach",
    "Cod Bay Fishery Harbour",
    "Vavuniya Tank",
    "Madukanda Viharaya",
    "Periyakulam Tank",
    "Cheddikulam Tank",
    "Vavuniya Town Park",
    "Vavuniya Water Park",
    "Omanthai Pillaiyar Kovil",
    "Nedunkeni Forest Area",
    "Maravankulam",
    "Siththivinayagar Kovil",
    "Andankulam Tank",
    "Sapumalgaskada Buddhist Monastery",
    "Sri Dalada Viharaya Madukanda",
    "Kandasamy Kovil",
    "Archeological Museum of Vavuniya",
    "Grand Jumma Mosques, Vavuniya",
    "Kalvari Church, Vavuniya"
]


const placesApiBudget = 9000;
const routesApiBudget = 9000;

let placesUsed = 0;
let routesUsed = 0;

function checkBudget(placesCost = 1, routesCost = 5) {
    if (placesUsed + placesCost > placesApiBudget) {
        throw new Error("Places API budget exceeded. Stopping population.");
    }

    if (routesUsed + routesCost > routesApiBudget) {
        throw new Error("Routes API budget exceeded. Stopping population.");
    }
}

async function populateDestinations(places = []) {

    const successful = [];
    const failed = [];

    for (const place of places) {

        try {
            // 🔴 estimate cost BEFORE execution
            checkBudget(1, 5);

            placesUsed += 1;
            routesUsed += 5;

            const result = await saveDestination(place);

            successful.push({
                input: place,
                result
            });

            console.log(`✓ Inserted: ${place}`);

            // throttle (important for rate limits)
            await sleep(1200);

        } catch (error) {

            failed.push({
                input: place,
                error: error.message
            });

            console.log(`✗ Failed: ${place} -> ${error.message}`);

            // optional: stop on budget error
            if (
                error.message.includes("budget exceeded")
            ) {
                console.log("🛑 Stopping population due to budget limit");
                break;
            }
        }
    }

    console.log("\n===== POPULATION SUMMARY =====");
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    console.log("\n===== API USAGE =====");
    console.log(`Places used: ${placesUsed}/${placesApiBudget}`);
    console.log(`Routes used: ${routesUsed}/${routesApiBudget}`);

    console.log("\n===== SUCCESSFUL PLACES =====");
    successful.forEach(item => console.log(item.input));

    console.log("\n===== FAILED PLACES =====");
    failed.forEach(item => console.log(item.input));

    return {
        successfulCount: successful.length,
        failedCount: failed.length,
        successful,
        failed,
        placesUsed,
        routesUsed,
        unsuccessfulList: failed.map(item => item.input)
    };
}


if (require.main === module) {
    populateDestinations(places)
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}