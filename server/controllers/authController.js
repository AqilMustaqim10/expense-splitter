const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: Generate JWT Token ────────────────────────────────────────────────
// Creates a signed token containing the user's ID
// Expires in 7 days — user stays logged in for a week
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── Register ──────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create the new user (password is hashed automatically via pre-save hook)
    const user = await User.create({ name, email, password });

    // Respond with user info + token so they're instantly logged in
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Authenticates an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare entered password with the hashed password in the database
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Respond with user info + fresh token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Current User ──────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently logged-in user's data (requires token)
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware (we'll build that next)
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getMe };
