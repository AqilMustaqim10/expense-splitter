const mongoose = require("mongoose");

// ─── Group Schema ──────────────────────────────────────────────────────────────
// A group has a name, description, a creator, and a list of members
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "", // Optional field
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a User document
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId, // Array of User references
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

module.exports = mongoose.model("Group", groupSchema);
