// File: utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // This configuration reads your .env file
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Must be SMTP_HOST
    port: process.env.SMTP_PORT, // Must be SMTP_PORT
    secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER, // Must be SMTP_USER
      pass: process.env.SMTP_PASSWORD, // Must be SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  });

  const mailOptions = {
    from: `TrustPass<${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
