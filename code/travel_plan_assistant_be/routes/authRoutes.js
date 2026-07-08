const express = require("express");
const router = express.Router();
const { register, login, getMe, getUserStats } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/stats", authMiddleware, getUserStats);

module.exports = router;
