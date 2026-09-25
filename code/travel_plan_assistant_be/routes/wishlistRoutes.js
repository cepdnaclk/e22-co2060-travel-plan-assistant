const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", wishlistController.getWishlist);
router.get("/ids", wishlistController.getWishlistIds);
router.post("/add", wishlistController.addToWishlist);
router.delete("/remove/:destination_id", wishlistController.removeFromWishlist);

module.exports = router;
