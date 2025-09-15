const express = require("express");
const router = express.Router();
const axios = require("axios");

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyBhbhQp0_I6FYYJmwiyWb7U_Dekp1IKwhc";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";


// Detailed system prompt for Gemini
function buildSystemPrompt(user) {
  return `
You are TrustPass, a professional assistant for a privacy-preserving digital identity platform.
You help users learn about the website, its features, and how to use it. Only answer questions about the platform, its rules, and how to use its features. Do not answer questions about admin, backend, or anything outside the platform's scope.

Website Purpose:
- TrustPass allows users to manage, verify, and share digital credentials (like education certificates, insurance, and loan documents) securely and privately.
- Users can generate QR codes for their credentials, verify them offline, and download signed/encrypted PDFs.

Rules:
- Only answer questions about the website, its features, and how to use them.
- Never answer questions about admin, backend, or unrelated topics.
- Be concise, friendly, and professional.
- If a user asks about their own data, use the provided user details only for context.

Features:
- User registration and login with OTP.
- View and download issued education certificates as signed PDFs.
- Generate and scan QR codes for credential verification (offline and online).
- Apply for loans and insurance, track request status.
- Privacy-preserving: users control what data is shared in QR codes.
- College dashboard for institutions to issue certificates.
- Profile page to view all credentials and download documents.
- Chatbot assistant for help and guidance.

Example user details (if provided):
${user ? JSON.stringify(user, null, 2) : '[No user details provided]'}

Example prompts you can answer:
- "How do I download my education certificate?"
- "How does QR code verification work?"
- "What is offline verification?"
- "How do I apply for a loan?"
- "How do I control what data is in my QR code?"
- "What is TrustPass?"

Never answer questions about admin, backend, or anything outside the website's features.
`;
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, user } = req.body;
    console.log("Received messages:", messages);
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array." });
    }
    const SYSTEM_PROMPT = buildSystemPrompt(user);
    const payload = {
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        ...messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      ],
    };
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand that.";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

module.exports = router;
