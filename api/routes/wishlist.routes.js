import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(isAuthenticated);

// Core Lab-04 REST endpoints
router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

// Lab-04 Section 23 Bonus: Wishlist Toggle
router.patch("/:productId/toggle", toggleWishlist);
router.post("/toggle/:productId", toggleWishlist);

export default router;
