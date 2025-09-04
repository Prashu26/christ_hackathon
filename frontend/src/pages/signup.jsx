import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";

const Signup = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [step, setStep] = useState("aadhaar"); // 'aadhaar' or 'otp'
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendEmail, setBackendEmail] = useState(""); // store returned email from backend
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000/api/v1/users";

  // --- Step 1: Send Aadhaar to backend ---
  const handleAadhaarSubmit = async () => {
    if (aadhaarNumber.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login/otp/send`, {
        aadhaarNumber,
      });

      toast.success(response.data.message);

      // backend uses email internally; just proceed to OTP step
      setStep("otp");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login/otp/verify`, {
        aadhaarNumber,
        otp,
      });

      toast.success(response.data.message);

      const userData = response.data.data;

      // Save user data to localStorage
      localStorage.setItem("userData", JSON.stringify(userData));

      // Redirect based on isAdmin
      if (userData.isAdmin) {
        navigate("/admin"); // admin dashboard
      } else {
        navigate("/landing"); // regular user landing page
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "OTP Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-bold text-center text-gray-800 mb-8"
        >
          Sign Up
        </motion.h1>

        <AnimatePresence mode="wait">
          {step === "aadhaar" && (
            <motion.div
              key="aadhaar-step"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  Enter your Aadhaar Number
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your 12-digit Aadhaar number for verification
                </p>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Enter Aadhaar Number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength="12"
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAadhaarSubmit}
                disabled={aadhaarNumber.length !== 12 || isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending OTP..." : "Next: Enter OTP"}
              </motion.button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.form
              key="otp-step"
              onSubmit={handleVerifyOtp}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter OTP
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
