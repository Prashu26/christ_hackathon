// File: models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ... (your existing fields: name, email, password, role, etc.)

    // --- ADD THESE FIELDS ---
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ... (your other userSchema methods like correctPassword, etc.)

const User = mongoose.model("User", userSchema);
module.exports = User;
