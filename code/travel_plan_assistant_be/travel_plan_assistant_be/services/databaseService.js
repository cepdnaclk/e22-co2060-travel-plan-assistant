const db = require("../config/db");

/**
 * Deletes all edges connected to a destinationID
 */
async function deleteNearbyForDestination(destinationID) {

    await db.execute(
        `
        DELETE FROM nearby_destinations
        WHERE source_id = ? OR destination_id = ?
        `,
        [destinationID, destinationID]
    );
}

async function deleteDestination(destinationID) {

    if (!destinationID) {
        throw new Error("destinationID is required");
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 1. delete edges first (important)
        await conn.execute(
            `
            DELETE FROM nearby_destinations
            WHERE source_id = ? OR destination_id = ?
            `,
            [destinationID, destinationID]
        );

        // 2. delete destination
        const [result] = await conn.execute(
            `
            DELETE FROM destinations
            WHERE destinationID = ?
            `,
            [destinationID]
        );

        if (result.affectedRows === 0) {
            throw new Error("Destination not found");
        }

        await conn.commit();

        return {
            success: true,
            deletedID: destinationID
        };

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
}

module.exports = {
    deleteNearbyForDestination,
    deleteDestination
};