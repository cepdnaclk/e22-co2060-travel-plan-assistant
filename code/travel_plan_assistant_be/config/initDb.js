const db = require("./db");
const bcrypt = require("bcryptjs");

async function initDb() {
    try {
        console.log("Initializing database tables...");
        
        // 1. Create users table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ users table ready.");

        // 2. Create user_travel_sessions table if not exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_travel_sessions (
                session_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                travel_plan JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ user_travel_sessions table ready.");

        // 3. Ensure destinations table has the newer columns
        try {
            const [columns] = await db.execute("SHOW COLUMNS FROM destinations");
            const columnNamesLower = columns.map(c => (c.Field || c.field || "").toLowerCase());
            
            const requiredColumns = [
                { name: "description", definition: "TEXT NULL" },
                { name: "photos", definition: "TEXT NULL" },
                { name: "user_reviews", definition: "TEXT NULL" },
                { name: "display_picture", definition: "VARCHAR(255) NULL" },
                { name: "place_id", definition: "VARCHAR(255) NULL" }
            ];

            for (const col of requiredColumns) {
                if (!columnNamesLower.includes(col.name.toLowerCase())) {
                    try {
                        console.log(`Adding missing column '${col.name}' to 'destinations' table...`);
                        await db.execute(`ALTER TABLE destinations ADD COLUMN ${col.name} ${col.definition}`);
                        console.log(`✓ Added column '${col.name}'.`);
                    } catch (alterErr) {
                        if (alterErr.code === 'ER_DUP_FIELDNAME' || alterErr.message.includes("Duplicate column name")) {
                            console.log(`Column '${col.name}' already exists (ignoring alter error).`);
                        } else {
                            console.error(`Error adding column '${col.name}':`, alterErr.message);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Warning: Failed to verify destinations table columns:", err.message);
        }

        // 4. Check if users exist, if not, seed default users
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM users");
        if (rows[0].count === 0) {
            console.log("Seeding default users...");
            
            const adminHash = await bcrypt.hash("adminpassword123", 10);
            const johnHash = await bcrypt.hash("password123", 10);
            const janeHash = await bcrypt.hash("password123", 10);

            await db.execute(`
                INSERT INTO users (name, email, password, role, status) VALUES
                ('System Admin', 'admin@travelplanner.com', ?, 'admin', 'approved'),
                ('John Doe', 'john@example.com', ?, 'user', 'pending'),
                ('Jane Smith', 'jane@example.com', ?, 'user', 'approved')
            `, [adminHash, johnHash, janeHash]);
            
            console.log("✓ Seed users added.");
            console.log("  - Admin: admin@travelplanner.com (pw: adminpassword123)");
            console.log("  - John (Pending): john@example.com (pw: password123)");
            console.log("  - Jane (Approved): jane@example.com (pw: password123)");
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

module.exports = initDb;
