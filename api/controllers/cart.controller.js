import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Helper function to format cart and filter populated products
const formatCartResponse = (cart) => {
  if (!cart) {
    return {
      cart: [],
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  const validItems = cart.filter((item) => item && item.product && item.product._id);
  const totalItems = validItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const totalPrice = validItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + price * qty;
  }, 0);

  return {
    cart: validItems,
    items: validItems,
    totalItems,
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

/**
 * Get current authenticated user's cart
 * GET /cart
 */
export const getCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const customer = await Customer.findById(customerId).populate("cart.product");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const { cart, items, totalItems, totalPrice } = formatCartResponse(customer.cart);

    return res.status(200).json({
      success: true,
      cart,
      items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
};

/**
 * Add a product to current user's cart
 * POST /cart/:productId
 */
export const addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;
    const qtyToAdd = Math.max(1, parseInt(req.body?.quantity, 10) || 1);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is already in cart
    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    const currentQty = existingItemIndex > -1 ? customer.cart[existingItemIndex].quantity : 0;
    const targetQty = currentQty + qtyToAdd;

    // Stock validation: Lab-05 Task 2
    if (targetQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${targetQty}) exceeds available stock (${product.stock})`,
      });
    }

    if (existingItemIndex > -1) {
      customer.cart[existingItemIndex].quantity = targetQty;
    } else {
      customer.cart.push({
        product: productId,
        quantity: targetQty,
      });
    }

    await customer.save();
    await customer.populate("cart.product");

    const { cart, items, totalItems, totalPrice } = formatCartResponse(customer.cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
      items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to cart",
    });
  }
};

/**
 * Update the quantity of a specific item in cart
 * PATCH /cart/:productId
 */
export const updateQuantity = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;
    const quantity = parseInt(req.body?.quantity, 10);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    if (isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity number is required",
      });
    }

    // Lab 05 Task 4: Quantity must be at least 1
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Lab 05 Task 4: Quantity must not exceed Product stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity (${quantity}) exceeds available stock (${product.stock})`,
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Lab 05 Task 4: Product must already exist in the cart
    const existingItem = (customer.cart || []).find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    existingItem.quantity = quantity;

    await customer.save();
    await customer.populate("cart.product");

    const { cart, items, totalItems, totalPrice } = formatCartResponse(customer.cart);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
      items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item quantity",
    });
  }
};

/**
 * Remove a product from current user's cart
 * DELETE /cart/:productId
 */
export const removeFromCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.cart = (customer.cart || []).filter(
      (item) => item.product && item.product.toString() !== productId.toString()
    );

    await customer.save();
    await customer.populate("cart.product");

    const { cart, items, totalItems, totalPrice } = formatCartResponse(customer.cart);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
      items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove item from cart",
    });
  }
};

/**
 * Clear all items from customer's cart
 * DELETE /cart
 */
export const clearCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
