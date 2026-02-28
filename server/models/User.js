const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── User Schema ───────────────────────────────────────────────────────────────
// Defines the structure of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Validation message
      trim: true, // Remove extra whitespace
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // No two users can share the same email
      lowercase: true, // Always store email in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

// ─── Pre-Save Hook ─────────────────────────────────────────────────────────────
// Using try/catch instead of next() to avoid async callback conflicts
userSchema.pre("save", async function () {
  // Only hash if the password field was changed
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10); // Generate a random salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// ─── Instance Method ───────────────────────────────────────────────────────────
// Custom method to compare entered password with the hashed one in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
