const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document schema for MongoDB
const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalFilename: { type: String, required: true },
  description: { type: String, default: '' },
  encryptedData: { type: Buffer, required: true },
  salt: { type: String, required: true },
  iv: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  hash: { type: String, required: true } // For integrity verification
});

const Document = mongoose.model('Document', documentSchema);

// Encryption utilities
const ALGORITHM = 'aes-256-gcm';

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encryptData(data, password) {
  const salt = crypto.randomBytes(32);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(ALGORITHM, key);
  cipher.setAAD(Buffer.from('document-encryption'));
  
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedData: Buffer.concat([encrypted, authTag]),
    salt: salt.toString('hex'),
    iv: iv.toString('hex')
  };
}

function decryptData(encryptedData, password, salt, iv) {
  const key = deriveKey(password, Buffer.from(salt, 'hex'));
  
  // Split encrypted data and auth tag
  const authTag = encryptedData.slice(-16);
  const encrypted = encryptedData.slice(0, -16);
  
  const decipher = crypto.createDecipher(ALGORITHM, key);
  decipher.setAAD(Buffer.from('document-encryption'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}

// Upload and encrypt document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const { password, description, filename, originalFilename } = req.body;
    const file = req.file;

    if (!file || !password) {
      return res.status(400).json({
        success: false,
        error: 'File and password are required'
      });
    }

    if (!filename || !filename.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Document name is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const documentName = filename.trim();
    console.log('Encrypting document:', documentName);

    // Encrypt the file data
    const { encryptedData, salt, iv } = encryptData(file.buffer, password);
    
    // Create hash for integrity verification
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Save to MongoDB
    const document = new Document({
      filename: documentName,
      originalFilename: originalFilename || file.originalname,
      description: description || '',
      encryptedData: encryptedData,
      salt: salt,
      iv: iv,
      size: file.size,
      mimetype: file.mimetype,
      hash: hash
    });

    await document.save();

    console.log('Document encrypted and saved:', document._id, 'as', documentName);

    res.json({
      success: true,
      documentId: document._id,
      message: 'Document uploaded and encrypted successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
});

// Get all documents (metadata only)
router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find({}, {
      filename: 1,
      description: 1,
      size: 1,
      mimetype: 1,
      uploadedAt: 1
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      documents: documents
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// Decrypt and retrieve document
router.post('/decrypt', async (req, res) => {
  try {
    const { documentId, password } = req.body;

    if (!documentId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and password are required'
      });
    }

    // Find document in database
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log('Attempting to decrypt document:', document.filename);

    try {
      // Decrypt the data
      const decryptedData = decryptData(
        document.encryptedData,
        password,
        document.salt,
        document.iv
      );

      // Verify integrity
      const hash = crypto.createHash('sha256').update(decryptedData).digest('hex');
      if (hash !== document.hash) {
        throw new Error('Data integrity check failed');
      }

      console.log('Document decrypted successfully:', document.filename);

      // Return decrypted content as base64 for frontend handling
      res.json({
        success: true,
        content: decryptedData.toString('base64'),
        filename: document.filename,
        mimetype: document.mimetype,
        message: 'Document decrypted successfully'
      });

    } catch (decryptError) {
      console.error('Decryption failed:', decryptError.message);
      res.status(401).json({
        success: false,
        error: 'Invalid password or corrupted data'
      });
    }

  } catch (error) {
    console.error('Decrypt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decrypt document'
    });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByIdAndDelete(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log('Document deleted:', document.filename);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

// Get documents for specific user/wallet (for loan and insurance integration)
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // For now, return all documents. In production, you'd filter by user
    const documents = await Document.find({}, {
      filename: 1,
      description: 1,
      size: 1,
      mimetype: 1,
      uploadedAt: 1
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      documents: documents
    });

  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user documents'
    });
  }
});

// Decrypt document for specific user (for loan and insurance integration)
router.post('/user-decrypt', async (req, res) => {
  try {
    const { documentId, password, walletAddress } = req.body;

    if (!documentId || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Document ID, password, and wallet address are required'
      });
    }

    // Find document in database
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    try {
      // Decrypt the data
      const decryptedData = decryptData(
        document.encryptedData,
        password,
        document.salt,
        document.iv
      );

      // Verify integrity
      const hash = crypto.createHash('sha256').update(decryptedData).digest('hex');
      if (hash !== document.hash) {
        throw new Error('Data integrity check failed');
      }

      res.json({
        success: true,
        content: decryptedData.toString('base64'),
        filename: document.filename,
        mimetype: document.mimetype,
        size: document.size,
        description: document.description
      });

    } catch (decryptError) {
      res.status(401).json({
        success: false,
        error: 'Invalid password or corrupted data'
      });
    }

  } catch (error) {
    console.error('User decrypt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decrypt document'
    });
  }
});

module.exports = router;
