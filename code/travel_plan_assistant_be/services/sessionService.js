const db = require("../config/db");
const { findByName } = require("./destinationService");

async function saveTravelSession(userId = 1, travelPlan) {

    const sql = `
        INSERT INTO user_travel_sessions (user_id, travel_plan)
        VALUES (?, ?)
    `;

    const [result] = await db.execute(sql, [
        userId,
        JSON.stringify(travelPlan)
    ]);

    return result.insertId;
}

async function getTravelSession(userId = 1) {

    const sql = `
        SELECT session_id, user_id, travel_plan
        FROM user_travel_sessions
        WHERE user_id = ?
        ORDER BY session_id DESC
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [userId]);

    if (rows.length === 0) return null;

    rows[0].travel_plan = JSON.parse(rows[0].travel_plan);

    return rows[0];
}

async function updateTravelSession(userId = 1, travelPlan) {

    const sql = `
        UPDATE user_travel_sessions
        SET travel_plan = ?
        WHERE user_id = ?
        ORDER BY session_id DESC
        LIMIT 1
    `;

    const [result] = await db.execute(sql, [
        JSON.stringify(travelPlan),
        userId
    ]);

    return result.affectedRows > 0;
}

async function getDestinationIdList(travelPlan) {

    if (!travelPlan || travelPlan.length === 0) return [];

    const idList = [];

    for (const place of travelPlan) {

        const destination = await findByName(place);

        if (destination) {
            idList.push(destination.id);
        }
    }

    return idList;
}

module.exports = {
    saveTravelSession,
    getTravelSession,
    updateTravelSession,
    getDestinationIdList
};