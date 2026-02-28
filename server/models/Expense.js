const mongoose = require("mongoose");

// ─── Split Detail Schema ───────────────────────────────────────────────────────
// Tracks how much each participant owes for a single expense
const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true, // How much this user owes for this expense
  },
});

// ─── Expense Schema ────────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true, // Every expense belongs to a group
    },
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Who paid for this expense
    },
    splits: [splitSchema], // Array of how much each person owes
    splitType: {
      type: String,
      enum: ["equal", "custom"], // Only these two split types allowed
      default: "equal",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Who added this expense to the app
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Expense", expenseSchema);
