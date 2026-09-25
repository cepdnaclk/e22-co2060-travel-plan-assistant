const express = require("express");
const router = express.Router();
const { createCheckoutSession, verifySubscriptionSuccess, getSubscriptionStatus } = require("../controllers/subscriptionController");
const auth = require("../middlewares/authMiddleware");

router.post("/create-checkout-session", auth, createCheckoutSession);
router.post("/verify", auth, verifySubscriptionSuccess);
router.get("/status", auth, getSubscriptionStatus);

module.exports = router;
