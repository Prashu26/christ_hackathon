import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Shield } from "lucide-react";

const LoginWithOtp = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/users/login/otp/send`,
        { email }
      );
      toast.success(response.data.message || "OTP sent to your email!");
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/users/login/otp/verify",
        { email, otp }
      );
      const digilockerData = response.data.data;

      toast.success("Verification successful!");
      console.log("Received mock DigiLocker data:", digilockerData);

      navigate("/", {
        state: { verifiedData: digilockerData },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed.");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Secure Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {step === "email"
              ? "Enter your email to get a one-time password."
              : `We’ve sent an OTP to ${email}`}
          </p>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.form
              key="email-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Send OTP"
                )}
              </motion.button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              key="otp-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                    placeholder="6-digit code from your email"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Verify & Login"
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to regular login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginWithOtp;
