const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

router.post("/login/otp/send", authController.sendLoginOtp);
router.post("/login/otp/verify", authController.verifyLoginOtp);
router.get("/me/:id", async (req, res) => {
  console.log("hii");
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ verified: user.verified, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit verification form
router.post("/:userId/verify", async (req, res) => {
  try {
    const { formName, universityOrCompany, option } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    user.verificationRequests.push({ formName, universityOrCompany, option });
    await user.save();

    res.json({
      message: "Verification request submitted! Admin will approve it.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Fetch all pending verifier requests
router.get("/pending-verifiers", async (req, res) => {
  try {
    const users = await User.find({ "verificationRequests.status": "pending" });
    let pendingRequests = [];

    users.forEach((user) => {
      user.verificationRequests.forEach((req) => {
        if (req.status === "pending") {
          pendingRequests.push({
            requestId: req._id,
            userId: user._id,
            name: user.name,
            email: user.email,
            universityOrCompany: req.universityOrCompany,
            option: req.option,
            submittedAt: req.submittedAt,
          });
        }
      });
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching pending requests" });
  }
});

// POST: Approve verifier request
router.post("/approve-verifier", async (req, res) => {
  const { requestId, email } = req.body;

  try {
    const user = await User.findOne({ "verificationRequests._id": requestId });
    if (!user) return res.status(404).json({ message: "Request not found" });

    const request = user.verificationRequests.id(requestId);
    request.status = "approved";

    await user.save();

    // Optionally: mark user as verified if needed
    user.verified = true;
    await user.save();

    // TODO: Send email to user about approval
    await sendEmail({
      to: user.email,
      subject: "TrustPass",
      text: `Your verifier request is approved!`,
    });

    res.json({ message: "Verifier approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve verifier" });
  }
});

// POST: Reject verifier request
router.post("/reject-verifier", async (req, res) => {
  const { requestId, email } = req.body;

  try {
    const user = await User.findOne({ "verificationRequests._id": requestId });
    if (!user) return res.status(404).json({ message: "Request not found" });

    const request = user.verificationRequests.id(requestId);
    request.status = "rejected";

    await user.save();

    // TODO: Send email to user about rejection
    // sendEmail(email, "Your verifier request was rejected.");

    res.json({ message: "Verifier request rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject verifier" });
  }
});

// GET: Fetch all pending loan requests
router.get("/pending-loans", async (req, res) => {
  try {
    const users = await User.find({ "loanRequests.status": "pending" });
    let pendingRequests = [];

    users.forEach((user) => {
      user.loanRequests.forEach((req) => {
        if (req.status === "pending") {
          pendingRequests.push({
            requestId: req.requestId,
            userId: user._id,
            name: user.name,
            email: user.email,
            loanType: req.loanType,
            amount: req.amount,
            purpose: req.purpose,
            income: req.income,
            employmentType: req.employmentType,
            documents: req.documents,
            submittedAt: req.submittedAt,
          });
        }
      });
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching pending loan requests" });
  }
});

// GET: Fetch all pending insurance requests
router.get("/pending-insurance", async (req, res) => {
  try {
    const users = await User.find({ "insuranceRequests.status": "pending" });
    let pendingRequests = [];

    users.forEach((user) => {
      user.insuranceRequests.forEach((req) => {
        if (req.status === "pending") {
          pendingRequests.push({
            requestId: req.requestId,
            userId: user._id,
            name: user.name,
            email: user.email,
            insuranceType: req.insuranceType,
            coverage: req.coverage,
            premium: req.premium,
            personalInfo: req.personalInfo,
            documents: req.documents,
            submittedAt: req.submittedAt,
          });
        }
      });
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching pending insurance requests" });
  }
});

// POST: Approve loan request
router.post("/approve-loan", async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const user = await User.findOne({ "loanRequests.requestId": requestId });
    if (!user) return res.status(404).json({ message: "Loan request not found" });

    const request = user.loanRequests.find(req => req.requestId === requestId);
    request.status = "approved";
    request.processedAt = new Date();
    request.adminNotes = adminNotes || "";

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Loan Application Approved - TrustPass",
      text: `Congratulations! Your loan application for ₹${request.amount} has been approved. You will receive the funds shortly.`,
    });

    res.json({ message: "Loan approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve loan" });
  }
});

// POST: Reject loan request
router.post("/reject-loan", async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const user = await User.findOne({ "loanRequests.requestId": requestId });
    if (!user) return res.status(404).json({ message: "Loan request not found" });

    const request = user.loanRequests.find(req => req.requestId === requestId);
    request.status = "rejected";
    request.processedAt = new Date();
    request.adminNotes = adminNotes || "";

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Loan Application Update - TrustPass",
      text: `We regret to inform you that your loan application for ₹${request.amount} has been declined. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
    });

    res.json({ message: "Loan request rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject loan" });
  }
});

// POST: Approve insurance request
router.post("/approve-insurance", async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const user = await User.findOne({ "insuranceRequests.requestId": requestId });
    if (!user) return res.status(404).json({ message: "Insurance request not found" });

    const request = user.insuranceRequests.find(req => req.requestId === requestId);
    request.status = "approved";
    request.processedAt = new Date();
    request.adminNotes = adminNotes || "";

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Insurance Application Approved - TrustPass",
      text: `Congratulations! Your ${request.insuranceType} insurance application has been approved. Coverage: ₹${request.coverage}, Premium: ₹${request.premium}.`,
    });

    res.json({ message: "Insurance approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve insurance" });
  }
});

// POST: Reject insurance request
router.post("/reject-insurance", async (req, res) => {
  const { requestId, adminNotes } = req.body;

  try {
    const user = await User.findOne({ "insuranceRequests.requestId": requestId });
    if (!user) return res.status(404).json({ message: "Insurance request not found" });

    const request = user.insuranceRequests.find(req => req.requestId === requestId);
    request.status = "rejected";
    request.processedAt = new Date();
    request.adminNotes = adminNotes || "";

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Insurance Application Update - TrustPass",
      text: `We regret to inform you that your ${request.insuranceType} insurance application has been declined. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
    });

    res.json({ message: "Insurance request rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject insurance" });
  }
});

module.exports = router;
