import express from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(isAuthenticated);

// Core Lab-05 REST endpoints
router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
