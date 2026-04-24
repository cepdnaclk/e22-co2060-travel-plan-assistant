const { getDistance } = require("./utils");


// Uses districtService.js output to find the closest district for a given lat, lng
function findClosestDistrict(lat, lng, districts){
    let closest = districts[0];
    let minDistance = getDistance(lat, lng, closest.lat, closest.lng);

    for (let i=1; i < districts.length; i++){
        const d = districts[i];
        const dist = getDistance(lat, lng, d.lat, d.lng);

        if (dist < minDistance){
            minDistance = dist;
            closest = d
        }
    }

    return {
        district_name: closest.district_name,
        district_id: closest.district_id
    };
}

module.exports = { findClosestDistrict };