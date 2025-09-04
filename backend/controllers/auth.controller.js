const axios = require("axios");
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/user.model"); // our demo users model

// In-memory OTP store (clears if server restarts)
const otpStore = new Map();

// --- Step 1: Send OTP using Aadhaar Number ---
exports.sendLoginOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber)
      return next(new ErrorHandler("Aadhaar number is required.", 400));

    // find user by Aadhaar number in DB
    const user = await User.findOne({ aadhaarNumber });
    if (!user)
      return next(
        new ErrorHandler("User not found. Aadhaar not registered.", 404)
      );

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(user.email, { otp, expires, aadhaarNumber });

    console.log(`\n--- OTP AUTH ---`);
    console.log(`Generated OTP for ${user.email} is: ${otp}`);
    console.log(`----------------\n`);

    // send email
    await sendEmail({
      to: user.email,
      subject: "Your Verification OTP",
      text: `Your One-Time Password is: ${otp}\nIt is valid for 10 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: `An OTP has been sent to the email linked with Aadhaar ending in ${aadhaarNumber.slice(
        -4
      )}.`,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return next(
      new ErrorHandler("Failed to send OTP email. Please try again later.", 500)
    );
  }
};

// --- Step 2: Verify OTP ---
exports.verifyLoginOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, otp } = req.body;
    if (!aadhaarNumber || !otp)
      return next(
        new ErrorHandler("Please provide an Aadhaar number and OTP.", 400)
      );

    // Find user by Aadhaar
    const user = await User.findOne({ aadhaarNumber });
    if (!user) return next(new ErrorHandler("User not found.", 404));

    // Get OTP from store
    const storedOtpData = otpStore.get(user.email);
    if (
      !storedOtpData ||
      storedOtpData.otp !== otp ||
      storedOtpData.expires < Date.now()
    ) {
      return next(new ErrorHandler("Invalid or expired OTP.", 401));
    }

    // OTP correct → clear OTP
    otpStore.delete(user.email);

    // Mark user as verified
    user.verified = true;
    await user.save();

    // Fetch mock DigiLocker data if needed
    try {
      const response = await axios.get("https://randomuser.me/api/?nat=in");
      const mock = response.data.results[0];

      // Prepare user data to send to frontend (localStorage)
      const userDataToSend = {
        _id: user._id,
        name: user.name || `${mock.name.first} ${mock.name.last}`,
        dateOfBirth:
          user.dateOfBirth ||
          new Date(mock.dob.date).toISOString().split("T")[0],
        gender: user.gender || mock.gender,
        photo: user.photo || mock.picture.large,
        aadhaarNumber: user.aadhaarNumber,
        email: user.email,
        verified: user.verified,
        isAdmin: user.isAdmin,
        verificationRequests: user.verificationRequests || [],
      };

      res.status(200).json({
        success: true,
        message: "Verification successful.",
        data: userDataToSend, // full user info
      });
    } catch (apiError) {
      return next(new ErrorHandler("Could not fetch mock user data.", 500));
    }
  } catch (error) {
    next(error);
  }
};
