const express = require("express");
const QRCode = require("qrcode");
const cryptoUtils = require("../utils/crypto");
const router = express.Router();

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

    const credentialData = {
      type: credentialType,
      data: userData,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      nonce: cryptoUtils.generateNonce(),
      mode: mode,
    };

    let qrData;

    if (mode === "offline") {
      const signature = cryptoUtils.generateOfflineSignature(credentialData);

      const publicKey = process.env.PUBLIC_KEY
        ? process.env.PUBLIC_KEY.replace(/\\n/g, "\n")
        : cryptoUtils.publicKey; // fallback from utils

      qrData = {
        ...credentialData,
        signature,
        publicKey,
      };
    } else {
      const token = cryptoUtils.generateCredentialToken(credentialData);
      qrData = {
        token,
        mode: "online",
        verifyUrl: `${req.protocol}://${req.get(
          "host"
        )}/api/credentials/verify`,
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
router.post("/verify", (req, res) => {
  try {
    const { token, scannedData } = req.body;

    let verificationResult = {
      isValid: false,
      credentialData: null,
      errors: [],
    };

    if (token) {
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

module.exports = router;
