import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all order routes
router.use(isAuthenticated);

// Create Payment Order (POST /orders/create-payment-order and alias POST /orders)
router.post("/create-payment-order", createPaymentOrder);
router.post("/", createPaymentOrder);

// Verify Razorpay Payment Signature (POST /orders/verify-payment)
router.post("/verify-payment", verifyPayment);

// Get authenticated user's orders (GET /orders)
router.get("/", getMyOrders);

// Get single order with ownership validation (GET /orders/:id)
router.get("/:id", getOrderById);

// Bonus: Update order status (PATCH /orders/:id/status)
router.patch("/:id/status", updateOrderStatus);

export default router;
