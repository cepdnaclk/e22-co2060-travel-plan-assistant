const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "travelplan_secret_key_123_abc";

// Register
async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }

        // Check if user exists
        const [existing] = await db.execute("SELECT user_id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        await db.execute(
            "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'user', 'pending')",
            [name, email, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful! Your account is pending admin approval."
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal server error during registration" });
    }
}

// Login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        // Find user
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check status
        if (user.status === "pending") {
            return res.status(403).json({ error: "Your account is pending admin approval." });
        }
        if (user.status === "rejected") {
            return res.status(403).json({ error: "Your account has been rejected by the admin." });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role, status: user.status },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Initials
        const initials = user.name
            .split(/[._-]/)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join("") || "U";

        return res.json({
            success: true,
            token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                initials
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error during login" });
    }
}

// Get Current User Profile (Me)
async function getMe(req, res) {
    try {
        const [rows] = await db.execute("SELECT user_id, name, email, role, status FROM users WHERE user_id = ?", [req.user.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // Initials
        const initials = user.name
            .split(/[._-]/)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join("") || "U";

        return res.json({
            success: true,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                initials
            }
        });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({ error: "Internal server error retrieving user profile" });
    }
}

// Get User stats for dashboard
async function getUserStats(req, res) {
    try {
        const userId = req.user.userId;

        // 1. Get total trips
        const [sessionRows] = await db.execute(
            "SELECT travel_plan FROM user_travel_sessions WHERE user_id = ?",
            [userId]
        );

        const totalTrips = sessionRows.length;

        // 2. Calculate unique districts explored
        let destinationIds = new Set();
        for (const row of sessionRows) {
            try {
                const plan = typeof row.travel_plan === "string" ? JSON.parse(row.travel_plan) : row.travel_plan;
                if (Array.isArray(plan)) {
                    plan.forEach(id => destinationIds.add(id));
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }

        let districtsExplored = 0;
        if (destinationIds.size > 0) {
            const placeholders = Array.from(destinationIds).map(() => "?").join(",");
            const [districtsRows] = await db.execute(
                `SELECT COUNT(DISTINCT district_id) as count FROM destinations WHERE destinationID IN (${placeholders})`,
                Array.from(destinationIds)
            );
            districtsExplored = districtsRows[0].count;
        }

        // 3. Ongoing/upcoming trips: count trips created in the last 7 days, or default to 1 if user has trips
        const [upcomingRows] = await db.execute(
            "SELECT COUNT(*) as count FROM user_travel_sessions WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            [userId]
        );
        let upcomingTrips = upcomingRows[0].count;
        if (totalTrips > 0 && upcomingTrips === 0) {
            upcomingTrips = 1; // Default to 1 ongoing if they have plans
        }

        return res.json({
            success: true,
            stats: {
                totalTrips,
                upcomingTrips,
                districtsExplored
            }
        });
    } catch (error) {
        console.error("getUserStats error:", error);
        return res.status(500).json({ error: "Internal server error fetching dashboard stats" });
    }
}

module.exports = {
    register,
    login,
    getMe,
    getUserStats
};
