import express from "express";
import {
  getProductById,
  searchSingleProduct,
  searchProducts,
  getDistinctCategories,
  getDistinctTags,
  getProductsByCategory,
  getAllProducts,
  createProduct,
  seedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// Specific routes before /:id
router.get("/search/single", searchSingleProduct);
router.get("/search", searchProducts);
router.get("/categories", getDistinctCategories);
router.get("/tags", getDistinctTags);

// Seeding endpoint
router.post("/seed", seedProducts);
router.get("/seed", seedProducts);

// Category filter route
router.get("/category/:category", getProductsByCategory);

// Get all products / Create product
router.get("/", getAllProducts);
router.post("/", createProduct);

// Get single product by MongoDB ID
router.get("/:id", getProductById);

export default router;
