import mongoose from "mongoose";
import Product from "../models/product.model.js";

/**
 * Fetch a single product by MongoDB _id
 * GET /products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find product by id
    const product = await Product.findById(id);

    // Product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Search for a single product by exact or partial name / query
 * GET /products/search/single?q=... or ?name=...
 */
export const searchSingleProduct = async (req, res) => {
  try {
    const query = req.query.q || req.query.name || req.query.keyword;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query 'q' or 'name' is required",
      });
    }

    const regex = new RegExp(query.trim(), "i");

    const product = await Product.findOne({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `No product found matching "${query}"`,
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Search multiple products by keyword, tags, and/or category
 * GET /products/search?q=...&category=...&tag=...
 */
export const searchProducts = async (req, res) => {
  try {
    const { q, search, category, tag } = req.query;
    const filter = {};

    const searchQuery = q || search;
    // Search query on name, description, or tags
    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), "i");
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    // Filter by category
    if (category && category.trim()) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Filter by tag
    if (tag && tag.trim()) {
      filter.tags = { $in: [new RegExp(tag.trim(), "i")] };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get distinct categories list
 * GET /products/categories
 */
export const getDistinctCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    return res.status(200).json({
      success: true,
      categories: categories.filter(Boolean),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get distinct tags list
 * GET /products/tags
 */
export const getDistinctTags = async (req, res) => {
  try {
    const tags = await Product.distinct("tags");
    return res.status(200).json({
      success: true,
      tags: tags.filter(Boolean),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get products by category
 * GET /products/category/:category
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category parameter is required",
      });
    }

    const regex = new RegExp(`^${category.trim()}$`, "i");
    const products = await Product.find({ category: regex }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      category: category.trim(),
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all products (with optional sorting/filtering)
 * GET /products
 */
export const getAllProducts = async (req, res) => {
  try {
    const { search, q, category, tag } = req.query;
    const filter = {};

    const searchQuery = search || q;
    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), "i");
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    if (category && category.trim()) {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (tag && tag.trim()) {
      filter.tags = { $in: [new RegExp(tag.trim(), "i")] };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Create a new product
 * POST /products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, tags } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

/**
 * Seed initial sample products
 * POST /products/seed
 */
export const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0 && !req.query.force) {
      const existing = await Product.find().limit(10);
      return res.status(200).json({
        success: true,
        message: `Database already contains ${count} products. Use ?force=true to re-seed.`,
        count,
        products: existing,
      });
    }

    if (req.query.force) {
      await Product.deleteMany({});
    }

    const sampleProducts = [
      {
        name: "Samsung Galaxy S24 Ultra 5G",
        description: "Titanium frame, 200MP camera, Snapdragon 8 Gen 3, 512GB Storage with AI photo editing and S-Pen.",
        price: 1199,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
        stock: 25,
        tags: ["smartphone", "samsung", "5g", "flagship", "deal"],
      },
      {
        name: "Sony WH-1000XM5 Wireless Headphones",
        description: "Industry-leading noise canceling with two processors and 8 microphones for crystal clear calls.",
        price: 348,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        stock: 40,
        tags: ["headphones", "audio", "sony", "wireless", "bluetooth"],
      },
      {
        name: "Ergonomic Mechanical Keyboard RGB",
        description: "Hot-swappable custom mechanical switches, wireless Bluetooth 5.1/Type-C connectivity with PBT keycaps.",
        price: 115,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        stock: 18,
        tags: ["keyboard", "gaming", "mechanical", "rgb", "accessories"],
      },
      {
        name: "Nike Air Max 2024 Edition",
        description: "Revolutionary Air-Sole cushioning with breathable Flyknit mesh upper for extreme daily comfort.",
        price: 130,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        stock: 50,
        tags: ["shoes", "nike", "running", "sneakers", "bestseller"],
      },
      {
        name: "Chronograph Minimalist Luxury Watch",
        description: "Sapphire crystal glass, genuine Italian leather strap, 50m water-resistant Japanese quartz movement.",
        price: 180,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        stock: 12,
        tags: ["watch", "luxury", "accessories", "menswear", "trending"],
      },
      {
        name: "Italian Espresso & Coffee Maker Pro",
        description: "15-bar professional Italian pump delivers optimal flavor extraction with manual steam wand for latte art.",
        price: 85,
        category: "Home Appliances",
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
        stock: 30,
        tags: ["coffee", "kitchen", "espresso", "home", "appliances"],
      },
      {
        name: "Hydrating Vitamin C Glow Serum 50ml",
        description: "Pure active vitamin C antioxidant serum for radiant, even-toned skin and deep hydration.",
        price: 28,
        category: "Health & Beauty",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
        stock: 80,
        tags: ["skincare", "beauty", "organic", "serum", "wellness"],
      },
      {
        name: "Organic Hass Avocados Pack (6 Pcs)",
        description: "Farm fresh, perfectly ripe, nutrient-rich certified organic Hass avocados ready to eat.",
        price: 9,
        category: "Grocery",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
        stock: 100,
        tags: ["organic", "fresh", "grocery", "healthy", "vegan"],
      },
    ];

    const created = await Product.insertMany(sampleProducts);

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${created.length} products`,
      count: created.length,
      products: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to seed products",
    });
  }
};

export default {
  getProductById,
  searchSingleProduct,
  searchProducts,
  getDistinctCategories,
  getDistinctTags,
  getProductsByCategory,
  getAllProducts,
  createProduct,
  seedProducts,
};
