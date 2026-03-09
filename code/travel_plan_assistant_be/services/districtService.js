const db = require("../config/db");

async function getAllDistricts() {
    const[districts] = await db.execute(
        "SELECT district_name, district_tag, lat, lng FROM districts"
    );

    if (!districts.length){
        throw new Error("No districts found");
    }

    return districts;
}

module.exports =  { getAllDistricts };