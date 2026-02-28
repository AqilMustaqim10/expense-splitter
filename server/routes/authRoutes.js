const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ─── Auth Routes ───────────────────────────────────────────────────────────────
// Public routes — no token required
router.post("/register", register); // Create new account
router.post("/login", login); // Login to existing account

// Protected route — token required
router.get("/me", protect, getMe); // Get current user info

module.exports = router;
