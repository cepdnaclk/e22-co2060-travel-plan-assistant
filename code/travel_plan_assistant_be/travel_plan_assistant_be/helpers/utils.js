const db = require("../config/db");
const axios = require("axios");

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = 
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Check if two coordinates are close
 */
function areCoordsClose(lat1, lng1, lat2, lng2, toleranceKm = 0.1) {
    return getDistance(lat1, lng1, lat2, lng2) <= toleranceKm;
}

/**
 * Check if the given coordinates are in SL
 */
function isInsideSriLanka(lat, lng) {
    const minLat = 5.9, maxLat = 9.9;
    const minLng = 79.5, maxLng = 81.9;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

module.exports = {
    getDistance,
    areCoordsClose,
    isInsideSriLanka
};