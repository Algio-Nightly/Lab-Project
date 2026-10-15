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

app.use(cors({
    origin: "http://localhost:5173",   
    credentials: true,
}));

// 2. Parse Cookies (populates req.cookies)
app.use(cookieParser());

// 3. Mount routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Database Connection & Start Server
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("Database connection error:", err));
}

export default app;
