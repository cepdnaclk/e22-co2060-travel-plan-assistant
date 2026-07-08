const db = require("../config/db");

// Get all users (except password hashes)
async function getUsers(req, res) {
    try {
        const [rows] = await db.execute(
            "SELECT user_id, name, email, role, status, created_at FROM users ORDER BY created_at DESC"
        );
        return res.json({
            success: true,
            users: rows
        });
    } catch (error) {
        console.error("getUsers error:", error);
        return res.status(500).json({ error: "Internal server error fetching users" });
    }
}

// Update user status (approve / reject)
async function updateUserStatus(req, res) {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!status || !["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value. Must be 'pending', 'approved', or 'rejected'" });
        }

        // Prevent admin from blocking themselves
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ error: "You cannot change your own status" });
        }

        const [result] = await db.execute(
            "UPDATE users SET status = ? WHERE user_id = ?",
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({
            success: true,
            message: `User status updated to '${status}' successfully.`
        });
    } catch (error) {
        console.error("updateUserStatus error:", error);
        return res.status(500).json({ error: "Internal server error updating user status" });
    }
}

module.exports = {
    getUsers,
    updateUserStatus
};
