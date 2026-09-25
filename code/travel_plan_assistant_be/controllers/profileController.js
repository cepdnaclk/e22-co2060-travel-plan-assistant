const db = require("../config/db");

async function getProfile(req, res) {
    try {
        const userId = req.user.userId;
        const [rows] = await db.execute(
            "SELECT name, email, phone, location, preferences FROM users WHERE user_id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // Fetch stats
        const [sessionRows] = await db.execute("SELECT COUNT(*) as count FROM user_travel_sessions WHERE user_id = ?", [userId]);
        const [wishlistRows] = await db.execute("SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?", [userId]);

        const stats = {
            tripsPlanned: sessionRows[0].count,
            placesVisited: wishlistRows[0].count, // using wishlist count for now
            photosTaken: 0, // static for now
            countries: 1 // static for now
        };

        const defaultPreferences = {
            favoriteCategories: ["Culture", "Nature", "Adventure", "Heritage", "Wildlife"],
            travelStyle: ["Budget-Friendly", "Solo Traveler", "Photography"],
            preferredTransport: "Train & Tuk-tuk",
            budgetRange: "$50 - $100 / day"
        };

        let preferences = defaultPreferences;
        if (user.preferences) {
            try {
                preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
            } catch(e) {}
        }

        res.json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                phone: user.phone || "+94 77 123 4567",
                location: user.location || "Colombo, Sri Lanka",
                preferences
            },
            stats
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { name, phone, location, preferences } = req.body;
        
        let query = "UPDATE users SET name = ?";
        const params = [name];

        if (phone !== undefined) {
            query += ", phone = ?";
            params.push(phone);
        }
        if (location !== undefined) {
            query += ", location = ?";
            params.push(location);
        }
        if (preferences !== undefined) {
            query += ", preferences = ?";
            params.push(JSON.stringify(preferences));
        }

        query += " WHERE user_id = ?";
        params.push(userId);

        await db.execute(query, params);

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Failed to update profile" });
    }
}

module.exports = {
    getProfile,
    updateProfile
};
