import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Check, X, Mail, Shield, CreditCard, FileText, DollarSign, Building } from "lucide-react";

const Admin = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingInsurance, setPendingInsurance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("verifiers");

  const API_BASE = "http://localhost:5000/api/v1/users"; // your admin routes

  // Fetch pending verification requests
  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-verifiers`);
      setPendingRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pending requests.");
    }
  };

  // Fetch pending loan requests
  const fetchPendingLoans = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-loans`);
      setPendingLoans(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pending loan requests.");
    }
  };

  // Fetch pending insurance requests
  const fetchPendingInsurance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-insurance`);
      setPendingInsurance(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pending insurance requests.");
    }
  };

  const fetchAllPendingRequests = async () => {
    await Promise.all([
      fetchPendingRequests(),
      fetchPendingLoans(),
      fetchPendingInsurance()
    ]);
  };

  useEffect(() => {
    fetchAllPendingRequests();
    const intervalId = setInterval(fetchAllPendingRequests, 10000); // 10000ms = 10s
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

  // Loan approval handlers
  const handleApproveLoan = async (requestId, adminNotes = "") => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-loan`, { requestId, adminNotes });
      toast.success("Loan approved and email sent!");
      setPendingLoans((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve loan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectLoan = async (requestId, adminNotes = "") => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-loan`, { requestId, adminNotes });
      toast.success("Loan request rejected and email sent!");
      setPendingLoans((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject loan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Insurance approval handlers
  const handleApproveInsurance = async (requestId, adminNotes = "") => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-insurance`, { requestId, adminNotes });
      toast.success("Insurance approved and email sent!");
      setPendingInsurance((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve insurance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInsurance = async (requestId, adminNotes = "") => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-insurance`, { requestId, adminNotes });
      toast.success("Insurance request rejected and email sent!");
      setPendingInsurance((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject insurance.");
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
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Verifier Requests</p>
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
                <p className="text-gray-600">Loan Requests</p>
                <p className="text-3xl font-bold text-green-600">{pendingLoans.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Insurance Requests</p>
                <p className="text-3xl font-bold text-purple-600">{pendingInsurance.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Pending</p>
                <p className="text-3xl font-bold text-red-600">{pendingRequests.length + pendingLoans.length + pendingInsurance.length}</p>
              </div>
              <FileText className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab("verifiers")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "verifiers"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="w-4 h-4" />
                <span>Verifier Requests ({pendingRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "loans"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Loan Requests ({pendingLoans.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("insurance")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "insurance"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Insurance Requests ({pendingInsurance.length})</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {activeTab === "verifiers" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Pending Verifier Requests
              </h2>
              {pendingRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No pending verifier requests</p>
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
                              Requested on: {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(request.requestId, request.email)}
                              disabled={isLoading}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(request.requestId, request.email)}
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
            </>
          )}

          {activeTab === "loans" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Pending Loan Requests
              </h2>
              {pendingLoans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No pending loan requests</p>
                  <p className="text-gray-400">All requests have been processed</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingLoans.map((request, index) => (
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
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {request.name}
                                </h3>
                                <p className="text-gray-600">{request.email}</p>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Loan Type: <span className="font-medium">{request.loanType}</span></p>
                                    <p className="text-sm text-gray-500">Amount: <span className="font-medium text-green-600">₹{request.amount?.toLocaleString()}</span></p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Purpose: <span className="font-medium">{request.purpose}</span></p>
                                    <p className="text-sm text-gray-500">Income: <span className="font-medium">₹{request.income?.toLocaleString()}</span></p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Employment: <span className="font-medium">{request.employmentType}</span></p>
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                              Applied on: {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApproveLoan(request.requestId)}
                              disabled={isLoading}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectLoan(request.requestId)}
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
            </>
          )}

          {activeTab === "insurance" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Pending Insurance Requests
              </h2>
              {pendingInsurance.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No pending insurance requests</p>
                  <p className="text-gray-400">All requests have been processed</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingInsurance.map((request, index) => (
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
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {request.name}
                                </h3>
                                <p className="text-gray-600">{request.email}</p>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Type: <span className="font-medium">{request.insuranceType}</span></p>
                                    <p className="text-sm text-gray-500">Coverage: <span className="font-medium text-purple-600">₹{request.coverage?.toLocaleString()}</span></p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Premium: <span className="font-medium">₹{request.premium?.toLocaleString()}</span></p>
                                    {request.personalInfo?.age && (
                                      <p className="text-sm text-gray-500">Age: <span className="font-medium">{request.personalInfo.age}</span></p>
                                    )}
                                  </div>
                                </div>
                                {request.personalInfo?.occupation && (
                                  <p className="text-sm text-gray-500 mt-1">Occupation: <span className="font-medium">{request.personalInfo.occupation}</span></p>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                              Applied on: {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApproveInsurance(request.requestId)}
                              disabled={isLoading}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectInsurance(request.requestId)}
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
