const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user.model");

// POST /api/contact/send
router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message, priority, department } = req.body;
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required." });
    }
    // Find all admin users
    const admins = await User.find({ isAdmin: true });
    if (!admins.length) {
      return res
        .status(500)
        .json({ success: false, error: "No admin emails found." });
    }
    const adminEmails = admins.map((a) => a.email);
    // Compose email
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b> ${message}</p>
      <p><b>Priority:</b> ${priority}</p>
      <p><b>Department:</b> ${department}</p>
    `;
    await sendEmail({
      to: adminEmails.join(","),
      subject: `[Contact] ${subject}`,
      text: message,
      html,
    });
    res.json({ success: true, message: "Message sent to admins." });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

module.exports = router;
