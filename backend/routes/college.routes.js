require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// College login (hardcoded password in .env)
router.post("/login", (req, res) => {
  const { collegeName, password } = req.body;
  if (
    password === process.env.COLLEGE_DASHBOARD_PASSWORD &&
    collegeName &&
    collegeName.length > 0
  ) {
    // In real app, use JWT/session. Here, just return success.
    return res.json({ success: true, collegeName });
  }
  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
});

// PDF, signing, and encryption logic
const PDFDocument = require("pdfkit");
const forge = require("node-forge");
const path = require("path");
const fs = require("fs");
const collegeKeys = require("../utils/collegeKeys");

router.post("/issue-certificate", async (req, res) => {
  const {
    aadhaarNumber,
    certificateName,
    issuedBy,
    details,
    marksOrCgpa,
    clgName,
  } = req.body;
  if (!aadhaarNumber || !certificateName || !issuedBy) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  try {
    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    const issuedTo = user.name;

    // Prepare certificate data for signing
    const certData = JSON.stringify({
      aadhaarNumber,
      certificateName,
      issuedBy,
      issuedTo,
      marksOrCgpa,
      clgName,
      details,
      issuedAt: new Date().toISOString(),
    });
    // Sign the data
    const privateKey = forge.pki.privateKeyFromPem(collegeKeys.privateKey);
    const md = forge.md.sha256.create();
    md.update(certData, "utf8");
    const signature = forge.util.encode64(privateKey.sign(md));
    const publicKeyPem = collegeKeys.publicKey;

    // Generate PDF
    const doc = new PDFDocument();
    const certDir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);
    const pdfFileName = `certificate_${aadhaarNumber}_${Date.now()}.pdf`;
    const pdfPath = path.join(certDir, pdfFileName);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(22).text("Academic Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Certificate Name: ${certificateName}`);
    doc.text(`Issued To: ${issuedTo}`);
    doc.text(`Aadhaar: ${aadhaarNumber}`);
    doc.text(`Issued By: ${issuedBy}`);
    if (clgName) doc.text(`College Name: ${clgName}`);
    if (marksOrCgpa) doc.text(`Marks/CGPA: ${marksOrCgpa}`);
    doc.text(`Details: ${details}`);
    doc.text(`Issued At: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(12).text("--- Digital Signature & Verification ---");
    // Prepare QR code data (public key and signature block)
    const qrBlock = ["Public Key:", publicKeyPem, "Signature:", signature].join(
      "\n"
    );

    // Generate QR code using 'qrcode' package
    const QRCode = require("qrcode");
    await new Promise((resolve, reject) => {
      QRCode.toDataURL(
        qrBlock,
        { errorCorrectionLevel: "H", width: 300 },
        (err, url) => {
          if (err) return reject(err);
          doc.image(url, { width: 150, align: "center" });
          resolve();
        }
      );
    });

    doc.moveDown();
    doc.fontSize(10).text("Public Key:");
    publicKeyPem.split("\n").forEach((line) => {
      if (line.trim()) doc.text(line.trim());
    });
    doc.moveDown(0.5);
    doc.fontSize(10).text("Signature:");
    for (let i = 0; i < signature.length; i += 64) {
      doc.text(signature.substring(i, i + 64));
    }
    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // Debug log to check for missing/empty fields
    const certObj = {
      certificateName,
      issuedBy,
      issuedTo,
      aadhaarNumber,
      marksOrCgpa,
      clgName,
      details,
      pdfUrl: `/api/college/certificates/${pdfFileName}`,
      publicKey: publicKeyPem,
      signature,
      issueDate: new Date(),
    };
    console.log("Certificate object to be saved:", certObj);
    user.educationCertificates.push(certObj);
    await user.save();

    return res.json({
      success: true,
      message: "Certificate issued and PDF generated",
      pdfUrl: `/api/college/certificates/${pdfFileName}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Serve certificate PDFs
router.get("/certificates/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../certificates", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

module.exports = router;
