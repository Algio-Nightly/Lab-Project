import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cors from "cors";

// Ensure .env is loaded regardless of working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();

// 1. Parse JSON bodies (req.body)
app.use(express.json());

// Dynamic CORS to support localhost and Vercel domains with credentials
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 2. Parse Cookies (populates req.cookies)
app.use(cookieParser());

// Database Connection Helper with caching for serverless environments
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Please add MONGO_URI to your Vercel Project Settings > Environment Variables.");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Database connection error:", err);
    throw new Error(`Database connection failed: ${err.message}`);
  }
};

// API health check (responds immediately without requiring database)
app.get("/api", (req, res) => {
  res.json({ 
    success: true, 
    message: "ShopKart API is running on Vercel",
    dbConnected: mongoose.connection.readyState >= 1
  });
});

// Database connection middleware - runs for all incoming API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err);
    res.status(500).json({ success: false, message: err.message || "Database connection failed" });
  }
});

// 3. Mount routes (both with and without /api prefix for flexibility)
const routes = [
  ["/customers", customerRoutes],
  ["/products", productRoutes],
  ["/wishlist", wishlistRoutes],
  ["/cart", cartRoutes],
  ["/orders", orderRoutes],
];

routes.forEach(([routePath, router]) => {
  app.use(routePath, router);
  app.use(`/api${routePath}`, router);
});

// Start Server for local development (skipped when running as Vercel Serverless Function)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("Failed to start server locally:", err));
}

export default app;
