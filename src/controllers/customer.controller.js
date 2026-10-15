import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import genToken from "../utils/generateToken.js";

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // All Fields Necessary
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !String(fullName).trim() ||
      !String(email).trim() ||
      !String(password) ||
      !String(phone).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    // Password must contain at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email must be unique
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find customer using email
    const customer = await Customer.findOne({ email: normalizedEmail });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, customer.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = genToken(customer._id);

    // Store JWT inside an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Return customer information and token (for Postman Bearer token compatibility)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { _id, fullName, email, phone } = req.user;

    return res.status(200).json({
      _id,
      fullName,
      email,
      phone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const logoutCustomer = async (req, res) => {
  try{
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export default { registerCustomer, loginCustomer, getProfile, logoutCustomer };
