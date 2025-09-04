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

module.exports = router;
