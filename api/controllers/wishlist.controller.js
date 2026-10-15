import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

/**
 * Get current authenticated user's wishlist
 * GET /wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;

    const customer = await Customer.findById(customerId).populate({
      path: "wishlist",
      select: "name description price category image stock tags",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const wishlist = customer.wishlist || [];

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wishlist",
    });
  }
};

/**
 * Add a product to current user's wishlist
 * POST /wishlist/:productId
 */
export const addToWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Verify product exists in Product collection
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

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Duplicate check: Lab-04 requires 409 Conflict if already saved
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    await customer.populate({
      path: "wishlist",
      select: "name description price category image stock tags",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add to wishlist",
    });
  }
};

/**
 * Remove a product from current user's wishlist
 * DELETE /wishlist/:productId
 */
export const removeFromWishlist = async (req, res) => {
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

    // Check if product is in wishlist: Lab-04 requires 404 if not found
    const isWishlisted = (customer.wishlist || []).some(
      (id) => id.toString() === productId.toString()
    );

    if (!isWishlisted) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await customer.save();

    await customer.populate({
      path: "wishlist",
      select: "name description price category image stock tags",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove from wishlist",
    });
  }
};

/**
 * Toggle a product in/out of current user's wishlist (Lab-04 Section 23 Bonus)
 * PATCH /wishlist/:productId/toggle
 */
export const toggleWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

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

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    let saved;
    let message;

    if (isAlreadyWishlisted) {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      saved = false;
      message = "Product removed from wishlist";
    } else {
      customer.wishlist.push(productId);
      saved = true;
      message = "Product added to wishlist";
    }

    await customer.save();
    await customer.populate({
      path: "wishlist",
      select: "name description price category image stock tags",
    });

    return res.status(200).json({
      success: true,
      message,
      saved,
      inWishlist: saved,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle wishlist",
    });
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
};
