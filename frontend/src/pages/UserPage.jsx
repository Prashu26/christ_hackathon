import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode } from "lucide-react";
import axios from "axios";

function UserPage() {
  const navigate = useNavigate();
  const [credentialTypes, setCredentialTypes] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [mode, setMode] = useState("offline");
  const [userData, setUserData] = useState({});
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldToggles, setFieldToggles] = useState({});

  const storedUser = JSON.parse(localStorage.getItem("userData"));

  // helper to calculate age
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchCredentialTypes();

    if (storedUser) {
      const age = calculateAge(storedUser.dateOfBirth);
      setUserData({
        ...storedUser,
        age,
        isOver18: age >= 18,
      });
    }
  }, []);

  const fetchCredentialTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/credentials/types"
      );
      setCredentialTypes(response.data.credentialTypes || {});
    } catch (error) {
      console.error("Error fetching credential types:", error);
      setError("Failed to load credential types.");
    }
  };

  const handleTypeChange = (type) => {
    if (type.toLowerCase().includes("educationcertificate")) {
      setSelectedType("EDUCATION");
    } else {
      setSelectedType(type);
    }
    setQrCode("");
    setError("");
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper: get issued education certificate (if any)
  const issuedEduCert =
    storedUser &&
    storedUser.educationCertificates &&
    storedUser.educationCertificates.length > 0
      ? storedUser.educationCertificates[
          storedUser.educationCertificates.length - 1
        ]
      : null;

  const generateQRCode = async () => {
    if (!selectedType) {
      setError("Please select a credential type");
      return;
    }

    // Education Certificate QR
    if (selectedType === "EDUCATION") {
      if (!issuedEduCert && Object.keys(userData).length === 0) {
        setError("Please enter your education details.");
        return;
      }

      // Map frontend fields to backend fields for EDUCATION
      const eduFieldMap = {
        certificateName: "degree",
        clgName: "institution",
        details: "graduationYear",
        marksOrCgpa: "marksOrCgpa",
        issuedTo: "issuedTo",
        aadhaarNumber: "aadhaarNumber",
        issueDate: "issueDate",
      };
      const qrData = {};
      const source = issuedEduCert || userData;
      Object.entries(eduFieldMap).forEach(([frontendKey, backendKey]) => {
        if (fieldToggles[frontendKey] !== false && source[frontendKey]) {
          qrData[backendKey] = source[frontendKey];
        }
      });

      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          "http://localhost:5000/api/credentials/generate",
          {
            credentialType: selectedType,
            userData: qrData,
            mode: mode,
          }
        );
        if (response.data.success) {
          setQrCode(response.data.qrCode);
        } else {
          setError("Failed to generate QR code");
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        setError("Failed to generate QR code");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Default for other types
    if (Object.keys(userData).length === 0) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/credentials/generate",
        {
          credentialType: selectedType,
          userData: userData,
          mode: mode,
        }
      );
      if (response.data.success) {
        setQrCode(response.data.qrCode);
      } else {
        setError("Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (!selectedType) return null;

    // Hardcoded education certificate fields (with extra info)
    const eduFields = [
      { key: "certificateName", label: "Degree", placeholder: "Enter degree" },
      {
        key: "clgName",
        label: "Institution",
        placeholder: "Enter institution",
      },
      {
        key: "details",
        label: "Graduation Year",
        placeholder: "Enter graduation year",
      },
      {
        key: "marksOrCgpa",
        label: "Marks/CGPA",
        placeholder: "Enter marks or CGPA",
      },
      { key: "issuedTo", label: "Issued To", placeholder: "Student name" },
      {
        key: "aadhaarNumber",
        label: "Aadhaar Number",
        placeholder: "Aadhaar number",
      },
      { key: "issueDate", label: "Issued Date", placeholder: "Issued date" },
    ];

    if (selectedType === "EDUCATION") {
      if (!issuedEduCert) {
        return (
          <div className="mb-6 text-center text-red-300 font-semibold">
            There is no issued document from your college.
          </div>
        );
      }
      return eduFields.map((f) => {
        // Special formatting for issued date
        let value = issuedEduCert[f.key] || "";
        if (f.key === "issueDate" && value) {
          value = new Date(value).toLocaleDateString();
        }
        return (
          <div key={f.key} className="mb-6 flex items-center gap-4">
            <label className="block mb-2 font-medium text-white w-40">
              {f.label}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white"
              value={value}
              readOnly
            />
            {/* Allow toggling for all fields */}
            <>
              <input
                type="checkbox"
                className="ml-2"
                checked={fieldToggles[f.key] !== false}
                onChange={() =>
                  setFieldToggles((t) => ({
                    ...t,
                    [f.key]: !(t[f.key] !== false),
                  }))
                }
                title="Include in QR code"
              />
              <span className="text-xs text-white/70">Show in QR</span>
            </>
          </div>
        );
      });
    }

    // Default fields (for all other credential types)
    if (!credentialTypes[selectedType]) return null;
    const fields = credentialTypes[selectedType].fields;
    return fields.map((field) => (
      <div key={field} className="mb-6">
        <label className="block mb-2 font-medium text-white">
          {field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")}
        </label>

        {field === "dateOfBirth" ? (
          <input
            type="date"
            className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white"
            value={userData.dateOfBirth || ""}
            disabled
          />
        ) : field === "age" ? (
          <input
            type="number"
            className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white"
            value={userData.age || ""}
            disabled
          />
        ) : field === "isOver18" ? (
          <input
            type="text"
            className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white"
            value={userData.isOver18 ? "Yes" : "No"}
            disabled
          />
        ) : (
          <input
            type="text"
            className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder={`Enter ${field}`}
            value={userData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
      <button
        className="absolute top-8 left-8 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/20 flex items-center gap-2"
        onClick={() => navigate("/generate-qr")}
      >
        <ArrowLeft size={20} /> Back to QR Options
      </button>

      <div className="text-center mb-12 pt-16">
        <h1 className="text-4xl font-bold mb-4">Generate Credential</h1>
        <p className="text-lg opacity-90">
          Create a verifiable credential and generate a QR code for sharing
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <div className="mb-6">
          <label className="block mb-2 font-medium text-white">
            Credential Type
          </label>
          <select
            className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="" className="bg-gray-800">
              Select credential type...
            </option>
            {Object.entries(credentialTypes).map(([key, type]) => (
              <option key={key} value={key} className="bg-gray-800">
                {type.name} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {selectedType && (
          <>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-white">
                Verification Mode
              </label>
              <div className="flex gap-4">
                <button
                  className={`flex-1 p-3 border border-white/30 rounded-lg bg-white/10 text-white cursor-pointer transition-all duration-300 ${
                    mode === "offline"
                      ? "bg-white/30 border-white/50"
                      : "hover:bg-white/20"
                  }`}
                  onClick={() => setMode("offline")}
                >
                  <div>Offline Mode</div>
                  <small className="block text-sm opacity-80">
                    Works without internet
                  </small>
                </button>
                <button
                  className={`flex-1 p-3 border border-white/30 rounded-lg bg-white/10 text-white cursor-pointer transition-all duration-300 ${
                    mode === "online"
                      ? "bg-white/30 border-white/50"
                      : "hover:bg-white/20"
                  }`}
                  onClick={() => setMode("online")}
                >
                  <div>Online Mode</div>
                  <small className="block text-sm opacity-80">
                    Blockchain verification
                  </small>
                </button>
              </div>
            </div>

            {renderFormFields()}

            {error && (
              <div className="mt-8 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 border-none rounded-lg text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={generateQRCode}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating QR Code...
                </div>
              ) : (
                <>
                  <QrCode size={20} />
                  Generate QR Code
                </>
              )}
            </button>

            {qrCode && (
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold mb-4">
                  Your Credential QR Code
                </h3>
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <img
                    src={qrCode}
                    alt="Credential QR Code"
                    className="max-w-full"
                  />
                </div>
                <p className="mb-2">
                  Show this QR code to verifiers to prove your credentials
                </p>
                <small className="opacity-80">
                  Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </small>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserPage;
