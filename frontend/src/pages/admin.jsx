import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Check, X, Mail, Shield } from "lucide-react";

const Admin = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api/v1/users"; // your admin routes

  // Fetch pending verification requests
  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-verifiers`);
      setPendingRequests(res.data); // assuming backend returns array of { requestId, name, email, universityOrCompany, option, submittedAt }
      fetchPendingRequests(); // Refresh after action
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pending requests.");
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    const intervalId = setInterval(fetchPendingRequests, 10000); // 10000ms = 10s
    return () => clearInterval(intervalId);
  }, []);

  const handleApprove = async (requestId, email) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-verifier`, { requestId, email });
      toast.success("Verifier approved and email sent!");
      setPendingRequests((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve verifier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId, email) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-verifier`, { requestId, email });
      toast.success("Verifier request rejected and email sent!");
      setPendingRequests((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject verifier.");
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 mb-12 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <User className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage verifier approval requests
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full"
            >
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Admin Access</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pendingRequests.length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Rejected Today</p>
                <p className="text-3xl font-bold text-red-600">0</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Pending Verifier Requests
          </h2>

          {pendingRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending requests</p>
              <p className="text-gray-400">All requests have been processed</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {request.name}
                            </h3>
                            <p className="text-gray-600">{request.email}</p>
                            <p className="text-sm text-gray-500">
                              {request.universityOrCompany}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              Option: {request.option}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Requested on:{" "}
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleApprove(request.requestId, request.email)
                          }
                          disabled={isLoading}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleReject(request.requestId, request.email)
                          }
                          disabled={isLoading}
                          className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
