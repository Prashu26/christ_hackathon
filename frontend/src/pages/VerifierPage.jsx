import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle, XCircle, Upload } from "lucide-react";
import QrScanner from "qr-scanner";
import axios from "axios";

function VerifierPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError("");
      setVerificationResult(null);

      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());

      // Initialize QR scanner
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleQRScan(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await qrScannerRef.current.start();
        setScanning(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraPermission(false);
      setError(
        "Camera access denied. Please allow camera permission or upload a QR code image."
      );
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleQRScan = async (scannedData) => {
    let data;
    try {
      data =
        typeof scannedData === "string" ? JSON.parse(scannedData) : scannedData;
      console.log("Parsed QR data:", data);
    } catch (e) {
      setError("Invalid QR code data");
      return;
    }

    if (data.token || data.signature) {
      // Existing logic for old QR format
      setLoading(true);
      stopScanning();

      try {
        console.log("Raw QR data:", scannedData);

        let parsedData;
        try {
          parsedData = JSON.parse(scannedData);
          console.log("Parsed QR data:", parsedData);
        } catch (e) {
          console.error("JSON parse error:", e);
          throw new Error("Invalid QR code format - not valid JSON");
        }

        if (parsedData.mode === "offline") {
          console.log("Processing offline credential");
          await verifyOfflineCredential(parsedData);
        } else if (parsedData.token) {
          console.log("Processing online credential");
          await verifyOnlineCredential(parsedData.token);
        } else {
          console.error("Unknown credential format:", parsedData);
          throw new Error("Unknown credential format - missing mode or token");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationResult({
          isValid: false,
          errors: [error.message || "Verification failed"],
        });
      } finally {
        setLoading(false);
      }
    } else if (data.credentialId && data.mode === "online") {
      // New logic: fetch credential from backend using credentialId
      try {
        const response = await axios.post(
          "http://localhost:5000/api/credentials/verify",
          {
            credentialId: data.credentialId,
          }
        );
        // Use the correct field from backend response
        setVerificationResult(response.data.verification);
        setError("");
      } catch (err) {
        setError("Verification failed: " + err.message);
      }
    } else {
      setError("Unknown credential format - missing mode or token");
    }
  };

  const verifyOfflineCredential = async (qrData) => {
    try {
      console.log("Verifying offline credential:", qrData);

      // Client-side offline verification
      const { signature, publicKey, ...dataToVerify } = qrData;

      // Check expiry
      if (Date.now() > dataToVerify.expiresAt) {
        console.log("Credential expired:", new Date(dataToVerify.expiresAt));
        setVerificationResult({
          isValid: false,
          errors: ["Credential has expired"],
          credentialData: dataToVerify,
        });
        return;
      }

      // For demonstration, we'll call the backend to verify signature
      // In a real offline scenario, this would be done client-side
      console.log("Sending verification request to backend...");
      const response = await axios.post(
        "http://localhost:5000/api/credentials/verify",
        {
          scannedData: qrData,
        }
      );

      console.log("Backend verification response:", response.data);
      setVerificationResult(response.data.verification);
    } catch (error) {
      console.error("Offline verification error:", error);
      setVerificationResult({
        isValid: false,
        errors: [`Failed to verify offline credential: ${error.message}`],
      });
    }
  };

  const verifyOnlineCredential = async (token) => {
    try {
      console.log("Verifying online credential with token:", token);
      const response = await axios.post(
        "http://localhost:5000/api/credentials/verify",
        {
          token: token,
        }
      );

      console.log("Online verification response:", response.data);
      setVerificationResult(response.data.verification);
    } catch (error) {
      console.error("Online verification error:", error);
      setVerificationResult({
        isValid: false,
        errors: [`Failed to verify online credential: ${error.message}`],
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setVerificationResult(null);

      const result = await QrScanner.scanImage(file);
      await handleQRScan(result);
    } catch (error) {
      console.error("File scan error:", error);
      setError(
        "Failed to scan QR code from image. Please ensure the image contains a valid QR code."
      );
      setLoading(false);
    }
  };

  const renderVerificationResult = () => {
    if (!verificationResult) return null;

    const { isValid, credentialData, errors } = verificationResult;

    return (
      <div
        className={`mt-8 p-6 rounded-xl text-center ${
          isValid
            ? "bg-green-500/20 border border-green-500/50"
            : "bg-red-500/20 border border-red-500/50"
        }`}
      >
        <div className="text-6xl mb-4">
          {isValid ? <CheckCircle size={64} /> : <XCircle size={64} />}
        </div>

        <h3 className="text-2xl font-bold mb-4">
          {isValid ? "Verification Successful ✅" : "Verification Failed ❌"}
        </h3>

        {errors && errors.length > 0 && (
          <div className="mb-4">
            <strong>Errors:</strong>
            <ul className="text-left mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="list-disc list-inside">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isValid && credentialData && (
          <div className="bg-white/10 rounded-lg p-4 mt-4 text-left">
            <h4 className="font-bold text-lg mb-2">Credential Details:</h4>
            <p>
              <strong>Type:</strong> {credentialData.type}
            </p>
            <p>
              <strong>Mode:</strong> {credentialData.mode}
            </p>
            <p>
              <strong>Issued:</strong>{" "}
              {new Date(credentialData.timestamp).toLocaleString()}
            </p>
            <p>
              <strong>Expires:</strong>{" "}
              {new Date(credentialData.expiresAt).toLocaleString()}
            </p>

            {credentialData.data && (
              <div className="mt-4">
                <strong>Data:</strong>
                <pre className="bg-black/20 p-2 rounded text-sm mt-2 overflow-auto">
                  {JSON.stringify(credentialData.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <button
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
          onClick={() => {
            setVerificationResult(null);
            setError("");
          }}
        >
          Verify Another Credential
        </button>
      </div>
    );
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
        <h1 className="text-4xl font-bold mb-4">Verify Credential</h1>
        <p className="text-lg opacity-90">
          Scan a QR code to verify user credentials instantly
        </p>
      </div>

      <div className="max-w-lg mx-auto text-center">
        {!scanning && !verificationResult && !loading && (
          <div>
            <div className="mb-8">
              <button
                className="w-full mb-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={startScanning}
              >
                <Camera size={24} />
                Start Camera Scanner
              </button>

              <p className="my-4 text-lg opacity-80">or</p>

              <button
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />
                Upload QR Code Image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {cameraPermission === false && (
              <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="mb-2">
                  Camera access is required for QR code scanning.
                </p>
                <p>
                  Please allow camera permission or upload an image instead.
                </p>
              </div>
            )}
          </div>
        )}

        {scanning && (
          <div className="relative mb-8">
            <video
              ref={videoRef}
              className="w-full max-w-md mx-auto rounded-xl bg-black"
              playsInline
            />
            <button
              className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
              onClick={stopScanning}
            >
              Stop Scanning
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Verifying credential...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-xl">
            {error}
          </div>
        )}

        {renderVerificationResult()}
      </div>
    </div>
  );
}

export default VerifierPage;
