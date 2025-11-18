import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import CartService from "../services/cartService.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // Token validity\

// Register
export const register = async (req, res, next) => {
  try {
    const { fullname, email: email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).notDeleted();
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const userRole = role === 'seller' ? "seller" : "user";
    const userStatus = userRole === 'seller' ? "pending" : "active";
    
    const user = new User({
       fullname, 
       email: email.toLowerCase(), 
       password,
       role: userRole,
       status: userStatus,
    });
    await user.save();

    // generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Merge guest cart if sessionId exists
    const sessionId = req.headers["session-id"];
    if (sessionId) {
      await CartService.mergeCarts(user._id, sessionId);
    }

    res.status(201).json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    console.log("Login request body", req.body);
    const { email, password } = req.body;

    // Debug: Check all users with this email
    const allUsers = await User.find({ email: email.toLowerCase() });
    console.log("All users with this email:", allUsers);

    // Debug: Check users with notDeleted
    const activeUsers = await User.find({ email: email.toLowerCase() }).notDeleted();
    console.log("Active users with this email:", activeUsers);

    // Debug: Check users with explicit deletedAt filter
    const explicitFilter = await User.find({ 
      email: email.toLowerCase(), 
      deletedAt: null 
    });
    console.log("Users with explicit deletedAt filter:", explicitFilter);

    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
    console.log("Final user found:", user);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Merge guest cart if sessionId exists
    const sessionId = req.headers["session-id"];
    if (sessionId) {
      await CartService.mergeCarts(user._id, sessionId);
    }

    res.json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

