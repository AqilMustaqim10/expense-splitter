// ─── Core Imports ─────────────────────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes"); // Group routes

const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes); // Mount group routes

// ─── Health Check Route ────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Expense Splitter API is running!" });
});

// ─── Database Connection + Server Start ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
