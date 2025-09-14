const express = require("express");
const QRCode = require("qrcode");
const cryptoUtils = require("../utils/crypto");
const router = express.Router();
const axios = require("axios");

// Predefined credential types
const CREDENTIAL_TYPES = {
  AGE_PROOF: {
    name: "Proof of Age",
    description: "Verify you are over 18",
    fields: ["dateOfBirth", "isOver18"],
  },
  IDENTITY: {
    name: "Identity Verification",
    description: "Basic identity proof",
    fields: ["name", "id", "issueDate"],
  },
  EDUCATION: {
    name: "Education Certificate",
    description: "Academic qualification proof",
    fields: ["degree", "institution", "graduationYear"],
  },
  EMPLOYMENT: {
    name: "Employment Verification",
    description: "Current employment status",
    fields: ["company", "position", "startDate"],
  },
};

// Get available credential types
router.get("/types", (req, res) => {
  res.json({
    success: true,
    credentialTypes: CREDENTIAL_TYPES,
  });
});

// Generate credential QR code (User flow)
router.post("/generate", async (req, res) => {
  try {
    const { credentialType, userData, mode = "offline" } = req.body;

    if (!credentialType || !userData) {
      return res.status(400).json({
        success: false,
        error: "Credential type and user data are required",
      });
    }

    // Only pick the required fields for the selected credential type
    const allowedFields = CREDENTIAL_TYPES[credentialType]?.fields || [];
    const minimalUserData = {};
    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        minimalUserData[field] = userData[field];
      }
    });

    const credentialData = {
      type: credentialType,
      data: minimalUserData,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      nonce: cryptoUtils.generateNonce(),
      mode: mode,
    };

    // Save to DB (pseudo, implement your own DB logic)
    // const savedCredential = await Credential.create(credentialData);
    // For demo, use a random ID:
    const credentialId = cryptoUtils.generateNonce();

    let qrData;
    if (mode === "offline") {
      // Sign the credential data
      const signature = cryptoUtils.signCredential(credentialData);
      qrData = {
        ...credentialData,
        signature,
        publicKey: cryptoUtils.publicKey,
      };
    } else {
      // Online mode: just reference by credentialId
      qrData = {
        credentialId,
        mode: "online",
        type: credentialType,
        timestamp: credentialData.timestamp,
        expiresAt: credentialData.expiresAt,
        // Optionally add more fields if needed
      };
    }

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      credentialData: qrData,
      expiresAt: credentialData.expiresAt,
    });
  } catch (error) {
    console.error("Error generating credential:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate credential",
    });
  }
});

// Verify credential (Online mode - Verifier flow)
router.post("/verify", async (req, res) => {
  try {
    const { token, scannedData, credentialId } = req.body;

    let verificationResult = {
      isValid: false,
      credentialData: null,
      errors: [],
    };

    if (credentialId) {
      // TODO: Replace this with your real DB lookup!
      // Example: const credential = await Credential.findById(credentialId);
      // For demo, just return a fake credential:
      const credential = {
        type: "Demo Credential",
        mode: "online",
        timestamp: Date.now() - 10000,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        data: { example: "This is a demo credential loaded by ID." },
      };

      if (!credential) {
        verificationResult.errors.push("Credential not found");
      } else if (Date.now() > credential.expiresAt) {
        verificationResult.errors.push("Credential has expired");
      } else {
        verificationResult.isValid = true;
        verificationResult.credentialData = credential;
      }
    } else if (token) {
      // Online JWT verification
      try {
        const decoded = cryptoUtils.verifyCredentialToken(token);

        // Check expiry
        if (cryptoUtils.isExpired(decoded.expiresAt)) {
          verificationResult.errors.push("Credential has expired");
        } else {
          verificationResult.isValid = true;
          verificationResult.credentialData = decoded;
        }
      } catch (error) {
        verificationResult.errors.push("Invalid or tampered credential");
      }
    } else if (scannedData) {
      // Parse scanned QR data for offline verification
      try {
        const qrData =
          typeof scannedData === "string"
            ? JSON.parse(scannedData)
            : scannedData;

        if (qrData.mode === "offline" && qrData.signature) {
          // Offline RSA signature verification
          const { signature, publicKey, ...dataToVerify } = qrData;

          // Check expiry
          if (cryptoUtils.isExpired(dataToVerify.expiresAt)) {
            verificationResult.errors.push("Credential has expired");
          } else if (
            cryptoUtils.verifyOfflineSignature(dataToVerify, signature)
          ) {
            verificationResult.isValid = true;
            verificationResult.credentialData = dataToVerify;
          } else {
            verificationResult.errors.push(
              "Invalid signature - credential may be tampered"
            );
          }
        } else {
          verificationResult.errors.push("Invalid credential format");
        }
      } catch (error) {
        verificationResult.errors.push("Failed to parse credential data");
      }
    } else {
      verificationResult.errors.push("No credential data provided");
    }

    res.json({
      success: verificationResult.isValid,
      verification: verificationResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying credential:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed",
    });
  }
});

// Get public key for offline verification
router.get("/public-key", (req, res) => {
  try {
    const publicKey = process.env.PUBLIC_KEY
      ? process.env.PUBLIC_KEY.replace(/\\n/g, "\n")
      : cryptoUtils.publicKey;

    res.json({
      success: true,
      publicKey: publicKey,
    });
  } catch (error) {
    console.error("Error getting public key:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get public key",
    });
  }
});

// Handle QR code scan (Client-side logic)
const handleQRScan = async (scannedData) => {
  let data;
  try {
    data =
      typeof scannedData === "string" ? JSON.parse(scannedData) : scannedData;
  } catch (e) {
    setError("Invalid QR code data");
    return;
  }

  if (data.token || data.signature) {
    // Existing logic for old QR format
    // ...
  } else if (data.credentialId && data.mode === "online") {
    // New logic: fetch credential from backend using credentialId
    try {
      const response = await axios.post("/api/credentials/verify", {
        credentialId: data.credentialId,
      });
      // handle response...
    } catch (err) {
      setError("Verification failed: " + err.message);
    }
  } else {
    setError("Unknown credential format - missing mode or token");
  }
};

module.exports = router;
