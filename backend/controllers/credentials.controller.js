const crypto = require('crypto');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// RSA key pair for signing credentials (in production, store securely)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Credential types configuration
const credentialTypes = {
  age: {
    id: 'age',
    title: 'Age Verification',
    description: 'Prove you are over 18 without revealing your exact age',
    requiredClaims: ['ageOver18']
  },
  identity: {
    id: 'identity',
    title: 'Identity Proof',
    description: 'Verify your identity without sharing personal details',
    requiredClaims: ['identityVerified']
  },
  education: {
    id: 'education',
    title: 'Education Certificate',
    description: 'Share your educational qualifications securely',
    requiredClaims: ['educationLevel', 'institution']
  },
  employment: {
    id: 'employment',
    title: 'Employment Status',
    description: 'Verify your employment without exposing salary details',
    requiredClaims: ['employmentStatus', 'employer']
  }
};

// Generate credential with QR code
const generateCredential = async (req, res) => {
  try {
    const { credentialType, userId } = req.body;

    if (!credentialType || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: credentialType and userId'
      });
    }

    if (!credentialTypes[credentialType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential type'
      });
    }

    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create credential data
    const credentialData = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', credentialTypes[credentialType].title],
      issuer: {
        id: 'did:example:issuer',
        name: 'DigitalID Authority'
      },
      issuanceDate: new Date(timestamp).toISOString(),
      expirationDate: new Date(timestamp + (24 * 60 * 60 * 1000)).toISOString(), // 24 hours
      credentialSubject: {
        id: `did:example:${userId}`,
        type: credentialType,
        ...generateCredentialClaims(credentialType)
      },
      nonce: nonce,
      issuedAt: timestamp,
      expiresAt: timestamp + (24 * 60 * 60 * 1000)
    };

    // Create both offline (RSA) and online (JWT) proofs
    const offlineProof = createOfflineProof(credentialData, privateKey);
    const onlineProof = createOnlineProof(credentialData);

    const signedCredential = {
      ...credentialData,
      proof: {
        offline: offlineProof,
        online: onlineProof
      }
    };

    // Generate QR code
    const qrCodeData = JSON.stringify(signedCredential);
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      credential: signedCredential,
      qrCodeData: qrCodeData,
      qrCodeDataURL: qrCodeDataURL,
      message: 'Credential generated successfully'
    });

  } catch (error) {
    console.error('Error generating credential:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify credential from QR code
const verifyCredential = async (req, res) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'Missing QR code data'
      });
    }

    let credential;
    try {
      credential = JSON.parse(qrCodeData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format',
        details: 'Could not parse credential data'
      });
    }

    // Verify expiration
    const now = Date.now();
    if (credential.expiresAt && credential.expiresAt < now) {
      return res.status(400).json({
        success: false,
        message: 'Credential has expired',
        details: `Expired on ${new Date(credential.expiresAt).toLocaleString()}`
      });
    }

    // Verify offline proof (RSA signature)
    const offlineValid = verifyOfflineProof(credential, publicKey);
    
    // Verify online proof (JWT)
    const onlineValid = verifyOnlineProof(credential);

    if (!offlineValid && !onlineValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
        details: 'Credential signature could not be verified'
      });
    }

    // Additional validations
    if (!credential.nonce || credential.nonce.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid nonce',
        details: 'Credential nonce is missing or invalid'
      });
    }

    res.json({
      success: true,
      message: 'Credential verified successfully',
      details: `${credential.type} - Issued by ${credential.issuer.name}`,
      credential: {
        type: credential.type,
        issuer: credential.issuer.name,
        issuedAt: credential.issuedAt,
        expiresAt: credential.expiresAt,
        subject: credential.credentialSubject
      },
      verificationMethods: {
        offline: offlineValid,
        online: onlineValid
      }
    });

  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      details: 'Internal server error during verification'
    });
  }
};

// Get public key for offline verification
const getPublicKey = (req, res) => {
  res.json({
    success: true,
    publicKey: publicKey,
    algorithm: 'RSA-2048',
    format: 'PEM'
  });
};

// Get available credential types
const getCredentialTypes = (req, res) => {
  res.json({
    success: true,
    credentialTypes: Object.values(credentialTypes)
  });
};

// Helper functions
function generateCredentialClaims(credentialType) {
  const claims = {};
  
  switch (credentialType) {
    case 'age':
      claims.ageOver18 = true;
      claims.ageVerified = true;
      break;
    case 'identity':
      claims.identityVerified = true;
      claims.kycCompleted = true;
      break;
    case 'education':
      claims.educationLevel = 'Bachelor\'s Degree';
      claims.institution = 'University of Technology';
      claims.graduationYear = 2023;
      break;
    case 'employment':
      claims.employmentStatus = 'Employed';
      claims.employer = 'Tech Solutions Inc.';
      claims.position = 'Software Developer';
      break;
  }
  
  return claims;
}

function createOfflineProof(credential, privateKey) {
  const credentialHash = crypto.createHash('sha256')
    .update(JSON.stringify(credential))
    .digest('hex');
  
  const signature = crypto.sign('sha256', Buffer.from(credentialHash), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });

  return {
    type: 'RSASignature2018',
    created: new Date().toISOString(),
    verificationMethod: 'did:example:issuer#key-1',
    signature: signature.toString('base64'),
    hash: credentialHash
  };
}

function createOnlineProof(credential) {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  const token = jwt.sign(credential, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '24h'
  });

  return {
    type: 'JwtProof2020',
    created: new Date().toISOString(),
    verificationMethod: 'did:example:issuer#jwt-key',
    jws: token
  };
}

function verifyOfflineProof(credential, publicKey) {
  try {
    if (!credential.proof || !credential.proof.offline) {
      return false;
    }

    const proof = credential.proof.offline;
    const signature = Buffer.from(proof.signature, 'base64');
    
    // Recreate credential without proof for verification
    const credentialForVerification = { ...credential };
    delete credentialForVerification.proof;
    
    const credentialHash = crypto.createHash('sha256')
      .update(JSON.stringify(credentialForVerification))
      .digest('hex');

    // Verify hash matches
    if (credentialHash !== proof.hash) {
      return false;
    }

    // Verify signature
    return crypto.verify('sha256', Buffer.from(credentialHash), {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }, signature);

  } catch (error) {
    console.error('Offline verification error:', error);
    return false;
  }
}

function verifyOnlineProof(credential) {
  try {
    if (!credential.proof || !credential.proof.online) {
      return false;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = credential.proof.online.jws;
    
    const decoded = jwt.verify(token, jwtSecret);
    return !!decoded;

  } catch (error) {
    console.error('Online verification error:', error);
    return false;
  }
}

module.exports = {
  generateCredential,
  verifyCredential,
  getPublicKey,
  getCredentialTypes
};
