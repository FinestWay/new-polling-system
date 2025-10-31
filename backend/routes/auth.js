// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register user (NO EMAIL VERIFICATION)
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // express-validator check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user already exists by email or username
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Create new user (assumes User model handles password hashing)
      const user = new User({ username, email, password });
      await user.save();

      // Generate JWT token for immediate login
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Return token and user (omit password)
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false,
          avatar: user.avatar || null,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Duplicate key (unique index) handling
      if (error && error.code === 11000) {
        const dupField = Object.keys(error.keyPattern || {})[0] || "field";
        const message =
          dupField === "email"
            ? "Email already registered"
            : dupField === "username"
            ? "Username already taken"
            : "Duplicate value";
        return res.status(400).json({ message });
      }

      // Mongo connectivity
      const msg = (error?.name || "") + " " + (error?.message || "");
      if (
        /ServerSelection|ECONN|ENOTFOUND|ECONNREFUSED|TLS|certificate/i.test(
          msg
        )
      ) {
        return res
          .status(503)
          .json({ message: "Database unavailable. Please try again shortly." });
      }

      if (error?.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      }

      return res
        .status(500)
        .json({
          message: "Server error (Registration)",
          error: error?.message,
        });
    }
  }
);

// (Keep your existing login, /me, update profile routes — unchanged)
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ message: "Invalid credentials (user not found)" });

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Invalid credentials (password mismatch)" });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false,
          avatar: user.avatar || null,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error (Login)" });
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error (Me)" });
  }
});

router.put(
  "/profile",
  auth,
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("avatar").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const { username, avatar } = req.body;
      const updates = {};

      if (username && username !== req.user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser)
          return res.status(400).json({ message: "Username already taken" });
        updates.username = username;
      }

      if (avatar) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error (Profile)" });
    }
  }
);

module.exports = router;
