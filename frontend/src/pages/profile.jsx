import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Edit,
  Shield,
  MapPin,
  Calendar,
  Mail,
  Phone,
  User,
  Lock,
  Copy,
  Check,
  QrCode,
  Download,
  Settings,
  Fingerprint,
  CreditCard,
} from "lucide-react";
import axios from "axios";

const ProfileSection = () => {
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = storedUser._id;

  const [profileData, setProfileData] = useState(null);

  const [visibilitySettings, setVisibilitySettings] = useState({
    aadhaar: false,
    address: false,
    phone: true,
    email: true,
    age: true,
    photo: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/users/me/${userId}`
        );
        const user = res.data.data;

        setProfileData({
          name: user.name || "",
          email: user.email || "••••••@••••••.com",
          phone: user.phone || "+91 ••••• •••••",
          aadhaar: user.aadhaarNumber
            ? `XXXX XXXX ${user.aadhaarNumber.slice(-4)}`
            : "XXXX XXXX XXXX",
          gender: user.gender || "",
          age: user.dateOfBirth
            ? new Date().getFullYear() -
              new Date(user.dateOfBirth).getFullYear()
            : "",
          address: user.address || {
            street: "Not Provided",
            city: "",
            state: "",
            pincode: "",
          },
          photo: user.photo || "",
          verificationLevel: user.verified
            ? "Level 3 Verified"
            : user.verificationRequests?.some((v) => v.status === "approved")
            ? "Verifier"
            : "Unverified",
          digitalIdNumber: `DID:2025:IND:${
            user.aadhaarNumber?.slice(-4) || "0000"
          }`,
          isAdmin: user.isAdmin || false,
          verificationRequests: user.verificationRequests || [],
        });

        // Update localStorage with latest data
        localStorage.setItem("userData", JSON.stringify(user));
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Toggle visibility of sensitive fields
  const toggleVisibility = (field) =>
    setVisibilitySettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

  // Copy field to clipboard
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const PrivacyToggle = ({ field, label, isVisible }) => (
    <button
      onClick={() => toggleVisibility(field)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        isVisible
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      }`}
    >
      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {label}
    </button>
  );

  const CopyButton = ({ text, fieldName, className = "" }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );
  // console.log(profileData.verificationRequests);

  if (loading) return <p>Loading profile...</p>;
  if (!profileData) return <p>User not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Digital Identity Profile
          </h1>
          <p className="text-gray-600">Secure • Verifiable • Privacy-First</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold">
                    {profileData.verificationLevel}
                  </span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  ID: {profileData.digitalIdNumber}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                  <QrCode className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  {isEditing ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Edit className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 flex flex-col lg:flex-row gap-8">
            {/* Left - Photo & Digital ID */}
            <div className="lg:w-1/3 flex flex-col items-center gap-6">
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 p-1">
                {visibilitySettings.photo ? (
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <PrivacyToggle
                    field="photo"
                    label="Photo"
                    isVisible={visibilitySettings.photo}
                  />
                </div>
              </div>

              {/* Digital ID Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white w-full">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-5 h-5" />
                  <span className="text-sm font-semibold">Digital ID Card</span>
                </div>
                <div className="text-xs opacity-80 mb-2">
                  Blockchain Verified
                </div>
                <div className="font-mono text-sm">
                  {profileData.digitalIdNumber}
                </div>
              </div>
            </div>

            {/* Right - Details */}
            <div className="lg:w-2/3 space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Personal
                  Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                      <input
                        type="text"
                        value={profileData.name}
                        readOnly={!isEditing}
                        className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <CopyButton text={profileData.name} fieldName="name" />
                    </div>
                  </div>

                  {/* Aadhaar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-600">
                        Aadhaar Number
                      </label>
                      <PrivacyToggle
                        field="aadhaar"
                        label="Aadhaar"
                        isVisible={visibilitySettings.aadhaar}
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={
                          visibilitySettings.aadhaar
                            ? storedUserData.aadhaarNumber
                            : profileData.aadhaar
                        }
                        readOnly
                        className="flex-1 bg-transparent outline-none text-gray-800 font-mono"
                      />
                      {visibilitySettings.aadhaar && (
                        <CopyButton
                          text={storedUserData.aadhaarNumber}
                          fieldName="aadhaar"
                        />
                      )}
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3" /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-600">
                        Age
                      </label>
                      <PrivacyToggle
                        field="age"
                        label="Age"
                        isVisible={visibilitySettings.age}
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={visibilitySettings.age ? profileData.age : "••"}
                        readOnly={!isEditing}
                        className="flex-1 bg-transparent outline-none text-gray-800"
                      />
                      {visibilitySettings.age && (
                        <span className="text-sm text-gray-500">years old</span>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Gender
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                      <input
                        type="text"
                        value={profileData.gender || ""}
                        readOnly
                        className="flex-1 bg-transparent outline-none text-gray-800"
                      />
                    </div>
                    {profileData.verificationRequests &&
                      profileData.verificationRequests.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-6 mt-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />{" "}
                            Verification Requests
                          </h3>
                          <ul className="space-y-2">
                            {profileData.verificationRequests.map(
                              (req, index) => (
                                <li
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-white rounded-xl border"
                                >
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {req.formName}
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                      {req.option} - {req.universityOrCompany}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      req.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : req.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {req.status.toUpperCase()}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
