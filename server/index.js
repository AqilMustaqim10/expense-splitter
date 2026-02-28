// ─── Core Imports ─────────────────────────────────────────────────────────────
const express = require("express"); // Web framework for building our API
const mongoose = require("mongoose"); // ODM for interacting with MongoDB
const cors = require("cors"); // Allows frontend to communicate with backend
require("dotenv").config(); // Loads variables from .env file

const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies

// ─── Health Check Route ────────────────────────────────────────────────────────
// Simple route to confirm the API is running
app.get("/", (req, res) => {
  res.json({ message: "Expense Splitter API is running!" });
});

// ─── Database Connection + Server Start ───────────────────────────────────────
// Connect to MongoDB Atlas first, then start listening for requests
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    // If connection fails, log the error and exit
    console.error("❌ MongoDB connection failed:", err.message);
  });
