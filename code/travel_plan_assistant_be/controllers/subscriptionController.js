const Stripe = require("stripe");
const db = require("../config/db");

// Using a mock/test secret key if one is not provided in env
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_fake_key_for_development");

async function createCheckoutSession(req, res) {
    try {
        const userId = req.user.userId;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Travel Plan Assistant Subscription",
                            description: "Unlimited travel plans",
                        },
                        unit_amount: 999, // $9.99
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/subscription`,
            client_reference_id: userId.toString(),
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
}

async function verifySubscriptionSuccess(req, res) {
    try {
        const { session_id } = req.body;
        const userId = req.user.userId;

        if (!session_id) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            // Update user to subscribed
            await db.execute("UPDATE users SET is_subscribed = TRUE WHERE user_id = ?", [userId]);
            
            return res.json({
                success: true,
                message: "Subscription verified successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                error: "Payment not completed"
            });
        }
    } catch (error) {
        console.error("Error verifying subscription:", error);
        res.status(500).json({ error: "Failed to verify subscription" });
    }
}

async function getSubscriptionStatus(req, res) {
    try {
        const userId = req.user.userId;
        const [rows] = await db.execute("SELECT is_subscribed FROM users WHERE user_id = ?", [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const [sessionRows] = await db.execute("SELECT COUNT(*) as count FROM user_travel_sessions WHERE user_id = ?", [userId]);
        const planCount = sessionRows[0].count;
        
        res.json({
            success: true,
            isSubscribed: !!rows[0].is_subscribed,
            planCount: planCount
        });
    } catch (error) {
        console.error("Error getting subscription status:", error);
        res.status(500).json({ error: "Failed to get subscription status" });
    }
}

module.exports = {
    createCheckoutSession,
    verifySubscriptionSuccess,
    getSubscriptionStatus
};
