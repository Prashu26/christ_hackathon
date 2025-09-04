import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Check,
  X,
  Mail,
  Shield,
  CreditCard,
  FileText,
  DollarSign,
  IdCard,
  Phone,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";

const Admin = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingInsurance, setPendingInsurance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("verifiers");

  // user data state
  const [userData, setUserData] = useState({});

  // visibility toggles for sensitive admin info
  const [showDetails, setShowDetails] = useState({
    aadhaar: false,
    phone: false,
    email: false,
    dob: false,
    address: false,
  });
  const toggleDetail = (field) => {
    setShowDetails((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const API_BASE = "http://localhost:5000/api/v1/users"; // backend route

  // Fetch functions
  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-verifiers`);
      setPendingRequests(res.data);
    } catch {
      toast.error("Failed to fetch pending requests.");
    }
  };

  const fetchPendingLoans = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-loans`);
      setPendingLoans(res.data);
    } catch {
      toast.error("Failed to fetch pending loans.");
    }
  };

  const fetchPendingInsurance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pending-insurance`);
      setPendingInsurance(res.data);
    } catch {
      toast.error("Failed to fetch pending insurance.");
    }
  };

  const fetchAllPendingRequests = async () => {
    await Promise.all([
      fetchPendingRequests(),
      fetchPendingLoans(),
      fetchPendingInsurance(),
    ]);
  };

  useEffect(() => {
    // Load userData from localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(storedUserData);

    fetchAllPendingRequests();
    const interval = setInterval(fetchAllPendingRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleApprove = async (requestId, email) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-verifier`, { requestId, email });
      toast.success("Verifier approved!");
      setPendingRequests((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
      toast.error("Failed to approve verifier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId, email) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-verifier`, { requestId, email });
      toast.success("Verifier rejected!");
      setPendingRequests((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
      toast.error("Failed to reject verifier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLoan = async (requestId) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-loan`, { requestId });
      toast.success("Loan approved!");
      setPendingLoans((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
      toast.error("Failed to approve loan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectLoan = async (requestId) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-loan`, { requestId });
      toast.success("Loan rejected!");
      setPendingLoans((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
      toast.error("Failed to reject loan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveInsurance = async (requestId) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/approve-insurance`, { requestId });
      toast.success("Insurance approved!");
      setPendingInsurance((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
      toast.error("Failed to approve insurance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInsurance = async (requestId) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/reject-insurance`, { requestId });
      toast.success("Insurance rejected!");
      setPendingInsurance((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
    } catch {
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-[28rem] bg-white shadow-xl p-6 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-md">
            <img
              src={userData.photo || "https://via.placeholder.com/128"}
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{userData.name || "Admin Name"}</h2>
          <p className="text-gray-500">System Administrator</p>
        </div>

        {/* Sensitive Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Sensitive Information</h3>
          <div className="space-y-4 text-gray-700">
            {/* Aadhaar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IdCard className="w-5 h-5" />
                <span>Aadhaar</span>
              </div>
              <span>{showDetails.aadhaar ? userData.aadhaarNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') || "••••••••••" : "••••••••••"}</span>
              <button onClick={() => toggleDetail("aadhaar")}>
                {showDetails.aadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Phone</span>
              </div>
              <span>{showDetails.phone ? "+91 9876543210" : "••••••••••"}</span>
              <button onClick={() => toggleDetail("phone")}>
                {showDetails.phone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </div>
              <span>{showDetails.email ? userData.email || "••••••••••" : "••••••••••"}</span>
              <button onClick={() => toggleDetail("email")}>
                {showDetails.email ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* DOB */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>DOB</span>
              </div>
              <span>{showDetails.dob ? userData.dateOfBirth?.split('-').reverse().join('-') || "••••••••••" : "••••••••••"}</span>
              <button onClick={() => toggleDetail("dob")}>
                {showDetails.dob ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Address</span>
              </div>
              <span>{showDetails.address ? "Bengaluru, India" : "••••••••••"}</span>
              <button onClick={() => toggleDetail("address")}>
                {showDetails.address ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Requests</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("verifiers")}
              className={`w-full text-left py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === "verifiers"
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Verifier Requests
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`w-full text-left py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === "loans"
                  ? "bg-green-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Loan Requests
            </button>
            <button
              onClick={() => setActiveTab("insurance")}
              className={`w-full text-left py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === "insurance"
                  ? "bg-purple-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Insurance Requests
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <img
                src={userData.photo || "https://via.placeholder.com/20"}
                alt="Admin"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="font-semibold">Admin Access</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600">Verifier Requests</p>
            <p className="text-3xl font-bold text-blue-600">
              {pendingRequests.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600">Loan Requests</p>
            <p className="text-3xl font-bold text-green-600">
              {pendingLoans.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600">Insurance Requests</p>
            <p className="text-3xl font-bold text-purple-600">
              {pendingInsurance.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600">Total Pending</p>
            <p className="text-3xl font-bold text-red-600">
              {pendingRequests.length +
                pendingLoans.length +
                pendingInsurance.length}
            </p>
          </div>
        </motion.div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {activeTab === "verifiers" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Verifier Requests</h2>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500">No pending verifier requests.</p>
                ) : (
                  pendingRequests.map((req) => (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-50 p-6 rounded-lg shadow mb-4"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-gray-800">{req.email}</p>
                      <p className="text-gray-600">Request ID: {req.requestId}</p>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => handleApprove(req.requestId, req.email)}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(req.requestId, req.email)}
                          disabled={isLoading}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === "loans" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-green-600">Loan Requests</h2>
                {pendingLoans.length === 0 ? (
                  <p className="text-gray-500">No pending loan requests.</p>
                ) : (
                  pendingLoans.map((req) => (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-50 p-6 rounded-lg shadow mb-4"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-gray-800">Loan Request ID: {req.requestId}</p>
                      <p className="text-gray-600">Amount: {req.amount || "N/A"}</p>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => handleApproveLoan(req.requestId)}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectLoan(req.requestId)}
                          disabled={isLoading}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === "insurance" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-600">Insurance Requests</h2>
                {pendingInsurance.length === 0 ? (
                  <p className="text-gray-500">No pending insurance requests.</p>
                ) : (
                  pendingInsurance.map((req) => (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-50 p-6 rounded-lg shadow mb-4"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-gray-800">Insurance Request ID: {req.requestId}</p>
                      <p className="text-gray-600">Type: {req.type || "N/A"}</p>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => handleApproveInsurance(req.requestId)}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectInsurance(req.requestId)}
                          disabled={isLoading}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
