import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

// Task 1: Register Customer
router.post("/register", registerCustomer);
router.post("/customers/register", registerCustomer);

// Task 2: Login Customer
router.post("/login", loginCustomer);
router.post("/customers/login", loginCustomer);

// Task 3: My Profile (Protected Route)
router.get("/me", isAuthenticated, getProfile);
router.get("/customers/me", isAuthenticated, getProfile);

router.post("/logout", logoutCustomer);
router.post("/customers/logout", logoutCustomer);


export default router;
