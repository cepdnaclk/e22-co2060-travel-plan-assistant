const express = require("express");
const router = express.Router();
const { getUsers, updateUserStatus } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.put("/users/:userId/status", authMiddleware, adminMiddleware, updateUserStatus);

module.exports = router;
