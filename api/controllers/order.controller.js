import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay, { getRazorpayInstance } from "../config/razorpay.js";

// Helper: validate shipping address fields
const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return "Full name is required";
  }
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return "Phone number is required";
  }
  // Validate phone format: digits, 10 to 14 characters
  const cleanPhone = phone.trim().replace(/[\s-]/g, "");
  if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
    return "Phone must contain a valid 10-digit number format";
  }

  if (!addressLine1 || typeof addressLine1 !== "string" || !addressLine1.trim()) {
    return "Address line 1 is required";
  }
  if (!city || typeof city !== "string" || !city.trim()) {
    return "City is required";
  }
  if (!state || typeof state !== "string" || !state.trim()) {
    return "State is required";
  }

  if (!pincode || typeof pincode !== "string" || !pincode.trim()) {
    return "Pincode is required";
  }
  const cleanPincode = pincode.trim();
  if (!/^\d{6}$/.test(cleanPincode)) {
    return "Pincode must contain 6 digits";
  }

  return null;
};

/**
 * Create Payment Order:
 * 1. Validate shipping address
 * 2. Load authenticated user's cart
 * 3. Validate stock & latest prices from DB
 * 4. Compute server-side total
 * 5. Create pending ShopKart order
 * 6. Create Razorpay order in paise
 * 7. Return checkout info
 *
 * POST /orders/create-payment-order (also supports POST /orders)
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError,
      });
    }

    // 2. Load authenticated user's cart
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Add products before checking out.",
      });
    }

    // 3. Load latest product data and verify stock
    const snapshotItems = [];
    let calculatedTotal = 0;

    for (const item of customer.cart) {
      const productId = item.product?._id || item.product;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID in cart",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available",
        });
      }

      const quantity = Number(item.quantity) || 1;
      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${product.name}`,
        });
      }

      // Stock check: requested quantity must not exceed available stock
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${quantity}`,
        });
      }

      const itemTotal = Number((product.price * quantity).toFixed(2));
      calculatedTotal += itemTotal;

      // Purchase-time snapshot
      snapshotItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || "",
      });
    }

    const totalAmount = Number(calculatedTotal.toFixed(2));
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total order amount must be greater than zero",
      });
    }

    // 4. Create pending ShopKart order
    const shopKartOrder = new Order({
      user: customerId,
      items: snapshotItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await shopKartOrder.save();

    // 5. Create Razorpay order (amount in paise)
    const amountInPaise = Math.round(totalAmount * 100);
    const rzp = getRazorpayInstance();

    let razorpayOrderId = null;
    try {
      const razorpayOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
        notes: {
          shopKartOrderId: shopKartOrder._id.toString(),
          customerId: customerId.toString(),
        },
      });
      razorpayOrderId = razorpayOrder.id;
      shopKartOrder.razorpayOrderId = razorpayOrderId;
      await shopKartOrder.save();
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      return res.status(500).json({
        success: false,
        message:
          rzpErr.error?.description ||
          rzpErr.message ||
          "Failed to initiate Razorpay payment order. Check your Razorpay API credentials.",
      });
    }

    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

/**
 * Verify Razorpay Payment Signature:
 * 1. Compute HMAC SHA256 of DB razorpayOrderId + "|" + razorpay_payment_id
 * 2. Compare against client-provided razorpay_signature
 * 3. If valid -> paymentStatus: "PAID", status: "PLACED", clear cart, decrement stock
 * 4. If invalid -> return 400 Bad Request, do not clear cart
 *
 * POST /orders/verify-payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters",
      });
    }

    // 1. Fetch order and verify ownership
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You cannot verify an order belonging to another customer",
      });
    }

    // Use DB stored razorpayOrderId for trusted HMAC verification
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    if (!trustedOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID not associated with this order",
      });
    }

    // 2. Compute HMAC SHA-256 signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "RAZORPAY_KEY_SECRET is not configured on the server",
      });
    }

    const payload = `${trustedOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // 3. Signature verification
    if (expectedSignature !== razorpay_signature) {
      // Keep order failed/pending and keep cart untouched
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    // 4. Verification succeeded: confirm order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 5. Decrement product stock in database
    for (const item of order.items) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      } catch (stockErr) {
        console.error(`Failed to decrement stock for product ${item.product}:`, stockErr);
      }
    }

    // 6. Clear user cart in MongoDB only after successful payment verification
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

/**
 * Get current authenticated user's order history
 * GET /orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ user: customerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

/**
 * Get single order by ID with ownership enforcement
 * GET /orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Rule: User must own the order
    if (order.user.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

/**
 * Bonus Challenge (+10 Marks):
 * Admin/Dev endpoint to progress order status:
 * PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
 *
 * PATCH /orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
