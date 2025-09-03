import React, { useState, useEffect } from 'react';
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
  Unlock,
  Copy,
  Check,
  QrCode,
  Download,
  Settings,
  Fingerprint,
  CreditCard
} from 'lucide-react';

const ProfileSection = () => {
  const [visibilitySettings, setVisibilitySettings] = useState({
    aadhar: false,
    address: false,
    phone: false,
    email: true,
    age: true,
    photo: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "Arjun Kumar Singh",
    email: "arjun.kumar@email.com",
    phone: "+91 98765 43210",
    aadhar: "XXXX XXXX 1234",
    age: 28,
    address: {
      street: "123 MG Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034"
    },
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    verificationLevel: "Level 3 Verified",
    digitalIdNumber: "DID:2024:IND:BLR:7891"
  });

  const toggleVisibility = (field) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const PrivacyToggle = ({ field, label, isVisible }) => (
    <button
      onClick={() => toggleVisibility(field)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        isVisible 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-red-100 text-red-700 hover:bg-red-200'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Digital Identity Profile</h1>
          <p className="text-gray-600">Secure • Verifiable • Privacy-First</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Header Section with Verification Status */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold">{profileData.verificationLevel}</span>
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
                  {isEditing ? <Check className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Photo and Basic Info */}
              <div className="lg:w-1/3">
                {/* Profile Photo */}
                <div className="relative mb-6">
                  <div className="w-48 h-48 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 p-1">
                    {visibilitySettings.photo ? (
                      <img 
                        src={profileData.photo} 
                        alt="Profile"
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-3xl flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <PrivacyToggle 
                      field="photo" 
                      label="Photo" 
                      isVisible={visibilitySettings.photo} 
                    />
                  </div>
                </div>

                {/* Digital Identity Card Preview */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Fingerprint className="w-5 h-5" />
                    <span className="text-sm font-semibold">Digital ID Card</span>
                  </div>
                  <div className="text-xs opacity-80 mb-2">Blockchain Verified</div>
                  <div className="font-mono text-sm">{profileData.digitalIdNumber}</div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs">Valid Until: 2034</div>
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Information */}
              <div className="lg:w-2/3 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                        <input 
                          type="text" 
                          value={profileData.name}
                          readOnly={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
                          onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                        />
                        <CopyButton text={profileData.name} fieldName="name" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Email Address</label>
                        <PrivacyToggle field="email" label="Email" isVisible={visibilitySettings.email} />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <input 
                          type="email" 
                          value={visibilitySettings.email ? profileData.email : "••••••@••••••.com"}
                          readOnly={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800"
                          onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                        />
                        {visibilitySettings.email && <CopyButton text={profileData.email} fieldName="email" />}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Phone Number</label>
                        <PrivacyToggle field="phone" label="Phone" isVisible={visibilitySettings.phone} />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <input 
                          type="tel" 
                          value={visibilitySettings.phone ? profileData.phone : "+91 ••••• •••••"}
                          readOnly={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800"
                          onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                        />
                        {visibilitySettings.phone && <CopyButton text={profileData.phone} fieldName="phone" />}
                      </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Age</label>
                        <PrivacyToggle field="age" label="Age" isVisible={visibilitySettings.age} />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input 
                          type="number" 
                          value={visibilitySettings.age ? profileData.age : "••"}
                          readOnly={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800"
                          onChange={(e) => setProfileData(prev => ({...prev, age: parseInt(e.target.value)}))}
                        />
                        {visibilitySettings.age && <span className="text-sm text-gray-500">years old</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government ID & Address */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Government ID & Address
                  </h3>

                  <div className="space-y-4">
                    {/* Aadhar Card */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Aadhar Card Number</label>
                        <PrivacyToggle field="aadhar" label="Aadhar" isVisible={visibilitySettings.aadhar} />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={visibilitySettings.aadhar ? "1234 5678 9012 3456" : profileData.aadhar}
                          readOnly
                          className="flex-1 bg-transparent outline-none text-gray-800 font-mono"
                        />
                        {visibilitySettings.aadhar && <CopyButton text="1234567890123456" fieldName="aadhar" />}
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Shield className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <PrivacyToggle field="address" label="Address" isVisible={visibilitySettings.address} />
                      </div>
                      <div className="p-3 bg-white rounded-xl border">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            {visibilitySettings.address ? (
                              <div className="space-y-1">
                                <div className="text-gray-800">{profileData.address.street}</div>
                                <div className="text-gray-600 text-sm">
                                  {profileData.address.city}, {profileData.address.state} - {profileData.address.pincode}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500">••• •••••••, •••••••••, ••••••••• - ••••••</div>
                            )}
                          </div>
                          {visibilitySettings.address && (
                            <CopyButton 
                              text={`${profileData.address.street}, ${profileData.address.city}, ${profileData.address.state} - ${profileData.address.pincode}`} 
                              fieldName="address" 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Privacy Controls
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <PrivacyToggle field="photo" label="Profile Photo" isVisible={visibilitySettings.photo} />
                    <PrivacyToggle field="email" label="Email" isVisible={visibilitySettings.email} />
                    <PrivacyToggle field="phone" label="Phone" isVisible={visibilitySettings.phone} />
                    <PrivacyToggle field="age" label="Age" isVisible={visibilitySettings.age} />
                    <PrivacyToggle field="aadhar" label="Aadhar" isVisible={visibilitySettings.aadhar} />
                    <PrivacyToggle field="address" label="Address" isVisible={visibilitySettings.address} />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Control what information is visible when sharing your digital identity. 
                    Hidden fields use Zero-Knowledge Proofs for verification without revealing actual data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate QR Code
          </button>
          <button className="bg-white text-gray-700 px-8 py-3 rounded-2xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Identity
          </button>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verify Identity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;