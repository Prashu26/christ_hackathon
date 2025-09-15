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
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingInsurance, setPendingInsurance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("verifiers");
  // Modal for viewing user-uploaded documents
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [currentDocs, setCurrentDocs] = useState([]);
  const [currentDocsUser, setCurrentDocsUser] = useState("");

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

  const navigate = useNavigate();

  // Admin logout handler
  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  // Handler to open docs modal
  const handleViewDocuments = (req) => {
    // Assume req.documents is an array of { name, url } or similar
    setCurrentDocs(req.documents || []);
    setCurrentDocsUser(req.email || req.userEmail || "");
    setShowDocsModal(true);
  };

  // Handler to close docs modal
  const handleCloseDocsModal = () => {
    setShowDocsModal(false);
    setCurrentDocs([]);
    setCurrentDocsUser("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar */}
      <div className="w-[28rem] bg-gray-800 shadow-2xl p-6 flex flex-col border-r border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300">
            <img
              src={"/default.svg"}
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {userData.name || "Admin Name"}
          </h2>
          <p className="text-blue-400 font-medium">System Administrator</p>
        </div>

        {/* Sensitive Info Card */}
        <div className="bg-gray-700 rounded-xl shadow-lg p-6 mb-6 border border-gray-600 hover:bg-gray-650 transition-colors duration-200">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Sensitive Information
          </h3>
          <div className="space-y-4 text-gray-300">
            {/* Aadhaar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IdCard className="w-5 h-5" />
                <span>Aadhaar</span>
              </div>
              <span>
                {showDetails.aadhaar
                  ? userData.aadhaarNumber?.replace(
                      /(\d{4})(\d{4})(\d{4})/,
                      "$1-$2-$3"
                    ) || "••••••••••"
                  : "••••••••••"}
              </span>
              <button onClick={() => toggleDetail("aadhaar")}>
                {showDetails.aadhaar ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
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
                {showDetails.phone ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </div>
              <span>
                {showDetails.email
                  ? userData.email || "••••••••••"
                  : "••••••••••"}
              </span>
              <button onClick={() => toggleDetail("email")}>
                {showDetails.email ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* DOB */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>DOB</span>
              </div>
              <span>
                {showDetails.dob
                  ? userData.dateOfBirth?.split("-").reverse().join("-") ||
                    "••••••••••"
                  : "••••••••••"}
              </span>
              <button onClick={() => toggleDetail("dob")}>
                {showDetails.dob ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Address</span>
              </div>
              <span>
                {showDetails.address ? "Bengaluru, India" : "••••••••••"}
              </span>
              <button onClick={() => toggleDetail("address")}>
                {showDetails.address ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-white">Requests</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("verifiers")}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "verifiers"
                  ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                  : "text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Verifier Requests
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "loans"
                  ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400"
                  : "text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Loan Requests
            </button>
            <button
              onClick={() => setActiveTab("insurance")}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "insurance"
                  ? "bg-purple-600 text-white shadow-lg ring-2 ring-purple-400"
                  : "text-gray-300 hover:bg-gray-600 hover:text-white"
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
          className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow transition-colors duration-200"
            >
              <X className="w-5 h-5" /> Logout
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200">
            <p className="text-gray-400">Verifier Requests</p>
            <p className="text-3xl font-bold text-blue-400">
              {pendingRequests.length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200">
            <p className="text-gray-400">Loan Requests</p>
            <p className="text-3xl font-bold text-green-400">
              {pendingLoans.length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200">
            <p className="text-gray-400">Insurance Requests</p>
            <p className="text-3xl font-bold text-purple-400">
              {pendingInsurance.length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200">
            <p className="text-gray-400">Total Pending</p>
            <p className="text-3xl font-bold text-red-400">
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
            className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700"
          >
            {activeTab === "verifiers" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-blue-400">
                  Verifier Requests
                </h2>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400">No pending verifier requests.</p>
                ) : (
                  pendingRequests.map((req) => (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-700 p-6 rounded-lg shadow-lg mb-4 border border-gray-600 hover:bg-gray-650 transition-colors duration-200"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-white">
                        {req.email}
                      </p>
                      <p className="text-gray-400">
                        Request ID: {req.requestId}
                      </p>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() =>
                            handleApprove(req.requestId, req.email)
                          }
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(req.requestId, req.email)}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
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
                <h2 className="text-2xl font-bold mb-6 text-green-400">
                  Loan Requests
                </h2>
                {pendingLoans.length === 0 ? (
                  <p className="text-gray-400">No pending loan requests.</p>
                ) : (
                  pendingLoans.map((req) => {
                    // Print the full user details for debugging
                    console.log('Loan User Details:', req);
                    return (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-700 p-6 rounded-lg shadow-lg mb-4 border border-gray-600 hover:bg-gray-650 transition-colors duration-200"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-white">
                        Loan Request ID: {req.requestId}
                      </p>
                      <p className="text-gray-400">Amount: {req.amount || "N/A"}</p>
                      {/* User Details */}
                      <div className="mt-2 mb-2 p-3 rounded-lg bg-gray-800 border border-gray-600">
                        <p className="text-gray-300 font-semibold mb-1">User Details:</p>
                        <p className="text-gray-400 text-sm">
                          <User className="inline w-4 h-4 mr-1" /> Name: {req.name || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <Mail className="inline w-4 h-4 mr-1" /> Email: {req.email || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <Shield className="inline w-4 h-4 mr-1" /> Employment Type: {req.employmentType || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <DollarSign className="inline w-4 h-4 mr-1" /> Income: {req.income ? `₹${req.income}` : "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <CreditCard className="inline w-4 h-4 mr-1" /> Loan Type: {req.loanType || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <FileText className="inline w-4 h-4 mr-1" /> Purpose: {req.purpose || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          <Calendar className="inline w-4 h-4 mr-1" /> Submitted: {req.submittedAt ? new Date(req.submittedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => handleApproveLoan(req.requestId)}
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectLoan(req.requestId)}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </motion.div>
                  );
                  })
                )}
              </div>
            )}

            {activeTab === "insurance" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-400">
                  Insurance Requests
                </h2>
                {pendingInsurance.length === 0 ? (
                  <p className="text-gray-400">
                    No pending insurance requests.
                  </p>
                ) : (
                  pendingInsurance.map((req) => (
                    <motion.div
                      key={req.requestId}
                      className="bg-gray-700 p-6 rounded-lg shadow-lg mb-4 border border-gray-600 hover:bg-gray-650 transition-colors duration-200"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p className="text-lg font-semibold text-white">
                        Insurance Request ID: {req.requestId}
                      </p>
                      <p className="text-gray-400">
                        Type:{" "}
                        {req.insuranceType
                          ? req.insuranceType.charAt(0).toUpperCase() +
                            req.insuranceType.slice(1)
                          : "N/A"}
                      </p>
                      <p className="text-gray-400">
                        Coverage: ₹{req.coverage?.toLocaleString() || "N/A"}
                      </p>
                      <p className="text-gray-400">
                        Premium: ₹{req.premium?.toLocaleString() || "N/A"}
                      </p>
                      <p className="text-gray-400">
                        Status:{" "}
                        {req.status
                          ? req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)
                          : "N/A"}
                      </p>
                      <p className="text-gray-400">
                        Submitted:{" "}
                        {req.submittedAt
                          ? new Date(req.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      {req.processedAt && (
                        <p className="text-gray-400">
                          Processed:{" "}
                          {new Date(req.processedAt).toLocaleDateString()}
                        </p>
                      )}
                      {req.adminNotes && (
                        <p className="text-gray-400">
                          Admin Notes: {req.adminNotes}
                        </p>
                      )}
                      {/* View Documents Button */}
                      <div className="mt-4 flex flex-wrap gap-4">
                        <button
                          onClick={() => handleApproveInsurance(req.requestId)}
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectInsurance(req.requestId)}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          onClick={() => handleViewDocuments(req)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          View Documents
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
                {/* Modal for viewing user-uploaded documents */}
                {showDocsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-700 relative">
                      <button
                        onClick={handleCloseDocsModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h3 className="text-xl font-bold text-white mb-4">
                        User Uploaded Documents
                      </h3>
                      <p className="text-gray-400 mb-2">
                        User: {currentDocsUser}
                      </p>
                      {currentDocs.length === 0 ? (
                        <p className="text-gray-400">No documents uploaded.</p>
                      ) : (
                        <ul className="space-y-3">
                          {currentDocs.map((doc, idx) => {
                            const docUrl =
                              typeof doc.url === "string" && doc.url.trim()
                                ? doc.url
                                : typeof doc.link === "string" &&
                                  doc.link.trim()
                                ? doc.link
                                : null;
                            return (
                              <li key={idx} className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                {docUrl ? (
                                  <a
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline break-all"
                                  >
                                    {doc.name || `Document ${idx + 1}`}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">
                                    {doc.name || `Document ${idx + 1}`}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
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
