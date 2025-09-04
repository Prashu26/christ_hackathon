const mongoose = require("mongoose");

const verificationFormSchema = new mongoose.Schema({
  formName: { type: String, required: true },
  universityOrCompany: { type: String, required: true },
  option: {
    type: String,
    enum: ["form", "university", "company"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  photo: { type: String },
  aadhaarNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }, // new field
  verificationRequests: [verificationFormSchema],
});

module.exports = mongoose.model("User", userSchema);
