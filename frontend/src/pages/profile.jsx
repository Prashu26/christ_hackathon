import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Edit,
  Shield,
  Calendar,
  Mail,
  Phone,
  User,
  Lock,
  Copy,
  Check,
  QrCode,
  Download,
  Fingerprint,
} from "lucide-react";
import axios from "axios";

const ProfileSection = () => {
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = storedUser._id;

  const [profileData, setProfileData] = useState(null);
  const [visibilitySettings, setVisibilitySettings] = useState({
    aadhaar: false,
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
          photo: user.photo || "",
          verificationLevel: user.verified
            ? "Level 3 Verified"
            : "Unverified",
          digitalIdNumber: `DID:2025:IND:$${
            user.aadhaarNumber?.slice(-4) || "0000"
          }`,
        });
        localStorage.setItem("userData", JSON.stringify(user));
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const toggleVisibility = (field) =>
    setVisibilitySettings((prev) => ({ ...prev, [field]: !prev[field] }));

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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-md ${
        isVisible
          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
          : "bg-gray-600/50 text-gray-300 hover:bg-gray-500/50"
      }`}
    >
      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {label}
    </button>
  );

  const CopyButton = ({ text, fieldName }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  if (loading) return <p className="text-white text-center">Loading profile...</p>;
  if (!profileData) return <p className="text-white text-center">User not found</p>;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 font-sans">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-2 tracking-tight">
          Your Digital Identity
        </h1>
        <p className="text-gray-400">Inspired by Spotify • Secure • Private</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#121212] rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
        {/* Top Section */}
        <div className="bg-gradient-to-r from-green-600/60 to-emerald-700/40 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-green-400" />
            <span className="font-semibold text-lg">
              {profileData.verificationLevel}
            </span>
            <div className="bg-black/30 px-3 py-1 rounded-full text-sm">
              {profileData.digitalIdNumber}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-2 bg-black/30 hover:bg-black/50 rounded-xl transition">
              <QrCode className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 bg-black/30 hover:bg-black/50 rounded-xl transition">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-black/30 hover:bg-black/50 rounded-xl transition"
            >
              {isEditing ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Edit className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 flex flex-col lg:flex-row gap-10">
          {/* Left Side */}
          <div className="lg:w-1/3 flex flex-col items-center gap-6">
            <div className="relative w-48 h-48 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <User className="w-20 h-20 text-gray-600" />
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <PrivacyToggle
                  field="photo"
                  label="Photo"
                  isVisible={visibilitySettings.photo}
                />
              </div>
            </div>

            {/* Digital ID Card */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-4 text-white w-full shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-5 h-5" />
                <span className="text-sm font-semibold">Digital ID</span>
              </div>
              <div className="text-xs opacity-80 mb-1">Blockchain Verified</div>
              <div className="font-mono text-sm tracking-wide">
                {profileData.digitalIdNumber}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-[#181818] rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-400" /> Profile Info
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <input
                      type="text"
                      value={profileData.name}
                      readOnly={!isEditing}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="flex-1 bg-transparent outline-none text-white font-medium"
                    />
                    <CopyButton text={profileData.name} fieldName="name" />
                  </div>
                </div>

                {/* Aadhaar */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400">Aadhaar</label>
                    <PrivacyToggle
                      field="aadhaar"
                      label="Aadhaar"
                      isVisible={visibilitySettings.aadhaar}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={
                        visibilitySettings.aadhaar
                          ? storedUser.aadhaarNumber
                          : profileData.aadhaar
                      }
                      readOnly
                      className="flex-1 bg-transparent outline-none text-white font-mono"
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400">Age</label>
                    <PrivacyToggle
                      field="age"
                      label="Age"
                      isVisible={visibilitySettings.age}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={visibilitySettings.age ? profileData.age : "••"}
                      readOnly={!isEditing}
                      className="flex-1 bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={profileData.email}
                      readOnly
                      className="flex-1 bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={profileData.phone}
                      readOnly
                      className="flex-1 bg-transparent outline-none text-white"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm text-gray-400">Gender</label>
                  <div className="flex items-center gap-2 bg-[#202020] p-3 rounded-xl mt-1">
                    <input
                      type="text"
                      value={profileData.gender || ""}
                      readOnly
                      className="flex-1 bg-transparent outline-none text-white"
                    />
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
