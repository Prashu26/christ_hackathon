const axios = require("axios"); // Make sure to import axios
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require("../utils/errorHandler");

// This will store OTPs in memory. It will reset if the server restarts.
const otpStore = new Map();

// --- Step 1: Send an OTP (This function is already correct) ---
exports.sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Email is required.", 400));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { otp, expires });

    console.log(`\n--- OTP AUTH ---`);
    console.log(`Generated OTP for ${email} is: ${otp}`);
    console.log(`----------------\n`);

    await sendEmail({
      from: `"TrustPass" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification OTP",
      text: `Your One-Time Password is: ${otp}\nIt is valid for 10 minutes.`,
    });

    res
      .status(200)
      .json({ success: true, message: `An OTP has been sent to ${email}.` });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return next(
      new ErrorHandler("Failed to send OTP email. Please try again later.", 500)
    );
  }
};

// --- Step 2: Verify the OTP and Return Mock Data ---
exports.verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return next(new ErrorHandler("Please provide an email and OTP.", 400));

    const storedOtpData = otpStore.get(email);

    if (
      !storedOtpData ||
      storedOtpData.otp !== otp ||
      storedOtpData.expires < Date.now()
    ) {
      return next(new ErrorHandler("Invalid or expired OTP.", 401));
    }

    // OTP is correct. Clear it from memory.
    otpStore.delete(email);

    // --- NEW LOGIC ---
    // Now, fetch dynamic mock data to send back
    try {
      const response = await axios.get("https://randomuser.me/api/?nat=in"); // Get an Indian user
      const userData = response.data.results[0];

      // Create a mock data object that looks like it's from DigiLocker
      const mockDigilockerData = {
        name: `${userData.name.first} ${userData.name.last}`,
        dateOfBirth: new Date(userData.dob.date).toISOString().split("T")[0],
        gender: userData.gender,
        photo: userData.picture.large, // Here is the photo URL
        aadhaarNumber: `xxxx-xxxx-${Math.floor(1000 + Math.random() * 900000)}`, // Random last 4-6 digits
      };

      res.status(200).json({
        success: true,
        message: "Verification successful.",
        data: mockDigilockerData, // Send the mock data to the frontend
      });
    } catch (apiError) {
      return next(new ErrorHandler("Could not fetch mock user data.", 500));
    }
  } catch (error) {
    next(error);
  }
};
