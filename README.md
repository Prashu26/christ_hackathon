# Privacy-Preserving Identity Verification System

A comprehensive web application that implements privacy-preserving identity verification using QR codes with both offline and online verification modes.

## 🎯 Overview

This hackathon project demonstrates a cutting-edge identity verification system that prioritizes user privacy while maintaining security and reliability. The system generates cryptographically signed QR codes containing verifiable credentials that can be validated both offline (using RSA signatures) and online (using JWT tokens and blockchain integration).

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM for client-side navigation
- **HTTP Client**: Axios for API communication

### Backend (Node.js + Express)
- **Framework**: Express.js for RESTful API
- **Cryptography**: Node.js built-in crypto module for RSA key generation
- **QR Generation**: QRCode library for generating QR codes
- **Authentication**: JWT for token-based authentication
- **Security**: CORS enabled, input validation

## 🚀 Features

### Core Functionality
- **Dual Verification Modes**:
  - **Offline**: RSA-2048 signature verification without internet
  - **Online**: JWT token validation with blockchain readiness
- **QR Code Generation**: Cryptographically signed credentials in QR format
- **Real-time Verification**: Instant credential validation with detailed feedback
- **Multiple Credential Types**: Age, Identity, Education, Employment verification

### Security Features
- **RSA-2048 Encryption**: Military-grade cryptographic signatures
- **Nonce-based Security**: Prevents replay attacks
- **Expiry Validation**: Time-bound credentials (24-hour default)
- **Tamper Detection**: Hash verification ensures data integrity
- **Zero-Knowledge Proofs**: Privacy-preserving verification (blockchain-ready)

### User Experience
- **Modern UI**: Glassmorphism design with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Flow**: Clear user/verifier role separation
- **Real-time Feedback**: Loading states and progress indicators
- **Error Handling**: Comprehensive error messages and recovery

## 📁 Project Structure

```
hackathon1/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── QRVerificationModal.jsx    # Main QR verification component
│   │   ├── pages/
│   │   │   └── boilerplate/
│   │   │       └── feautres.jsx           # Features showcase page
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js             # Authentication logic
│   │   └── credentials.controller.js      # Credential generation/verification
│   ├── routes/
│   │   ├── auth.routes.js                 # Auth API endpoints
│   │   └── credentials.routes.js          # Credential API endpoints
│   ├── models/
│   │   └── user.model.js                  # User data models
│   ├── utils/
│   │   ├── errorHandler.js                # Error handling utilities
│   │   ├── sendEmail.js                   # Email services
│   │   └── sendToken.js                   # Token utilities
│   ├── server.js                          # Express server configuration
│   ├── package.json
│   └── ...
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📡 API Endpoints

### Credential Management
- `POST /api/v1/credentials/generate` - Generate new credential with QR code
- `POST /api/v1/credentials/verify` - Verify credential from QR data
- `GET /api/v1/credentials/public-key` - Get public key for offline verification
- `GET /api/v1/credentials/types` - Get available credential types

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile

## 🔧 Usage

### For Users (Credential Generation)
1. Click "Try Demo" on the QR Code Generation feature
2. Select "I'm a User"
3. Choose credential type (Age, Identity, Education, Employment)
4. QR code is generated with cryptographic signature
5. Share QR code with verifiers

### For Verifiers (Credential Verification)
1. Click "Try Demo" on the QR Code Generation feature
2. Select "I'm a Verifier"
3. Click "Start Camera Scan" or upload QR image
4. System validates signatures and expiry
5. View verification results with credential details

## 🔐 Security Implementation

### Offline Verification
- **RSA-2048 Key Pair**: Generated on server startup
- **SHA-256 Hashing**: Credential integrity verification
- **PSS Padding**: Enhanced security for RSA signatures
- **Public Key Distribution**: Available via API endpoint

### Online Verification
- **JWT Tokens**: HS256 algorithm with secret key
- **Expiry Validation**: Time-bound token validity
- **Blockchain Ready**: Structure compatible with Polygon ID

### Data Protection
- **No Personal Data Storage**: Zero-knowledge approach
- **Nonce Prevention**: Replay attack protection
- **Hash Verification**: Tamper detection
- **Secure Transport**: HTTPS ready (production)

## 🌐 Technology Stack Details

### Frontend Dependencies
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.2",
  "axios": "^1.11.0",
  "lucide-react": "^0.542.0",
  "tailwindcss": "^4.1.12",
  "framer-motion": "^12.23.12"
}
```

### Backend Dependencies
```json
{
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "qrcode": "^1.5.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.2",
  "bcryptjs": "^3.0.2",
  "mongoose": "^8.18.0"
}
```

## 🚀 Future Enhancements

### Blockchain Integration
- **Polygon ID SDK**: Zero-knowledge proof verification
- **Smart Contracts**: On-chain credential registry
- **IPFS Storage**: Decentralized credential storage
- **DID Integration**: W3C Decentralized Identifiers

### Advanced Features
- **Biometric Authentication**: Fingerprint/face recognition
- **Multi-signature**: Enhanced security with multiple keys
- **Credential Revocation**: Real-time credential invalidation
- **Analytics Dashboard**: Verification statistics and insights

### Mobile App
- **React Native**: Cross-platform mobile application
- **Camera Integration**: Native QR code scanning
- **Offline Storage**: Local credential management
- **Push Notifications**: Real-time verification alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Hackathon Achievement

This project demonstrates:
- **Innovation**: Novel approach to privacy-preserving identity verification
- **Technical Excellence**: Robust cryptographic implementation
- **User Experience**: Intuitive and accessible interface
- **Scalability**: Architecture ready for production deployment
- **Security**: Military-grade encryption and tamper-proof design

## 📞 Support

For questions, issues, or contributions, please open an issue on the GitHub repository or contact the development team.

---

**Built with ❤️ for the Hackathon - Empowering Privacy-First Digital Identity**
