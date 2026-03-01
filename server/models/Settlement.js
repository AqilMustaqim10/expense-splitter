const mongoose = require("mongoose");

// ─── Settlement Schema ─────────────────────────────────────────────────────────
// Tracks the status of a payment between two people in a group
// A settlement is created when a debtor clicks "Mark as Paid"
const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The debtor — person who owes money
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The creditor — person who should receive money
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      // pending   = debtor marked as paid, waiting for creditor to confirm
      // confirmed = creditor confirmed they received the money
      // cancelled = either party cancelled/undid the settlement
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    markedPaidAt: {
      type: Date,
      default: Date.now, // When debtor clicked "Mark as Paid"
    },
    confirmedAt: {
      type: Date, // When creditor clicked "Confirm Received"
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settlement", settlementSchema);
