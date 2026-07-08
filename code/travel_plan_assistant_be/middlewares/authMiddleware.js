const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "travelplan_secret_key_123_abc";

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch user from DB to verify current status
        const [rows] = await db.execute("SELECT user_id, email, role, status FROM users WHERE user_id = ?", [decoded.userId]);
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }

        const user = rows[0];

        // Check if user is approved
        if (user.status !== "approved") {
            return res.status(403).json({ error: `Access denied. Your account status is '${user.status}'.` });
        }

        req.user = {
            userId: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ error: "Invalid or expired token." });
    }
}

module.exports = authMiddleware;
