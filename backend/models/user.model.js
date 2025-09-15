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

const loanApprovalSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  loanType: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  income: { type: Number, required: true },
  employmentType: { type: String, required: true },
  documents: [{ type: String }], // Document IDs from storage
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String },
});

const insuranceApprovalSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  insuranceType: { type: String, required: true },
  coverage: { type: Number, required: true },
  premium: { type: Number, required: true },
  personalInfo: {
    age: Number,
    occupation: String,
    healthConditions: String,
  },
  documents: [{ type: String }], // Document IDs from storage
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String },
});

const educationCertificateSchema = new mongoose.Schema({
  certificateName: { type: String, required: true },
  issuedBy: { type: String, required: true }, // College/University name
  issuedTo: { type: String, required: true }, // Student name
  aadhaarNumber: { type: String, required: true },
  marksOrCgpa: { type: String }, // marks or CGPA
  clgName: { type: String }, // College name (redundant for clarity)
  issueDate: { type: Date, default: Date.now },
  details: { type: String }, // e.g., degree, year, etc.
  pdfUrl: { type: String },
  publicKey: { type: String },
  signature: { type: String },
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
  loanRequests: [loanApprovalSchema],
  insuranceRequests: [insuranceApprovalSchema],
  educationCertificates: [educationCertificateSchema],
});

module.exports = mongoose.model("User", userSchema);
