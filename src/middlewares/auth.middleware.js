import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Support Bearer token for Postman test plans
    if (!token && req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Customer not found",
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default isAuthenticated;
