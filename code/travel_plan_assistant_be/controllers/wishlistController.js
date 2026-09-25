const db = require("../config/db");

async function getWishlist(req, res) {
    try {
        const userId = req.user.userId;
        const [rows] = await db.execute(`
            SELECT w.wishlist_id, w.destination_id as id, w.note,
                   d.name, dist.district_name as location, d.type, d.tag,
                   d.rating, d.display_picture as image, d.description
            FROM wishlists w
            JOIN destinations d ON w.destination_id = d.destinationID
            LEFT JOIN districts dist ON d.district_id = dist.district_id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);

        const formatted = rows.map(r => {
            let parsedTag = r.tag;
            if (typeof r.tag === "string") {
                try {
                    parsedTag = JSON.parse(r.tag);
                } catch (e) {
                    parsedTag = [r.tag];
                }
            }
            
            // Generate full image URL
            const baseUrl = process.env.BASE_URL || "http://localhost:5000";
            const imageUrl = r.image 
                ? `${baseUrl}/public/destinations/${r.image}`
                : "https://images.unsplash.com/photo-1572451479139-6a308211d8be?auto=format&fit=crop&q=80&w=800";

            return {
                id: r.id,
                wishlist_id: r.wishlist_id,
                name: r.name,
                location: r.location || "Sri Lanka",
                category: Array.isArray(parsedTag) ? parsedTag[0] : (parsedTag || "Attraction"),
                rating: r.rating || 4.5,
                image: imageUrl,
                note: r.note || "A must-visit place in Sri Lanka!",
            };
        });

        res.json({ success: true, items: formatted });
    } catch (err) {
        console.error("Error fetching wishlist:", err);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
}

async function addToWishlist(req, res) {
    try {
        const userId = req.user.userId;
        const { destination_id } = req.body;
        
        await db.execute(
            "INSERT IGNORE INTO wishlists (user_id, destination_id) VALUES (?, ?)",
            [userId, destination_id]
        );
        res.json({ success: true, message: "Added to wishlist" });
    } catch (err) {
        console.error("Error adding to wishlist:", err);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const userId = req.user.userId;
        const { destination_id } = req.params;
        
        await db.execute(
            "DELETE FROM wishlists WHERE user_id = ? AND destination_id = ?",
            [userId, destination_id]
        );
        res.json({ success: true, message: "Removed from wishlist" });
    } catch (err) {
        console.error("Error removing from wishlist:", err);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
}

async function getWishlistIds(req, res) {
    try {
        const userId = req.user.userId;
        const [rows] = await db.execute("SELECT destination_id FROM wishlists WHERE user_id = ?", [userId]);
        const ids = rows.map(r => r.destination_id);
        res.json({ success: true, ids });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch wishlist ids" });
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistIds
};
