const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const forge = require('node-forge');

class CryptoUtils {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_testing_only';
    
    // Generate demo keys if environment variables are not set
    if (!process.env.PUBLIC_KEY || !process.env.PRIVATE_KEY) {
      const keypair = forge.pki.rsa.generateKeyPair(2048);
      this.publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      this.privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
    } else {
      this.publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
      this.privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
    }
  }

  // Generate JWT token for credentials
  generateCredentialToken(credentialData) {
    const payload = {
      ...credentialData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
      nonce: crypto.randomBytes(16).toString('hex')
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  // Verify JWT token
  verifyCredentialToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Generate RSA signature for offline verification
  generateOfflineSignature(data) {
    try {
      const privateKey = forge.pki.privateKeyFromPem(this.privateKey);
      const md = forge.md.sha256.create();
      md.update(JSON.stringify(data), 'utf8');
      const signature = privateKey.sign(md);
      return forge.util.encode64(signature);
    } catch (error) {
      throw new Error('Failed to generate signature');
    }
  }

  // Verify RSA signature for offline verification
  verifyOfflineSignature(data, signature) {
    try {
      const publicKey = forge.pki.publicKeyFromPem(this.publicKey);
      const md = forge.md.sha256.create();
      md.update(JSON.stringify(data), 'utf8');
      const decodedSignature = forge.util.decode64(signature);
      return publicKey.verify(md.digest().bytes(), decodedSignature);
    } catch (error) {
      return false;
    }
  }

  // Generate secure nonce
  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Validate expiry timestamp
  isExpired(timestamp) {
    return Date.now() > timestamp;
  }
}

module.exports = new CryptoUtils();
