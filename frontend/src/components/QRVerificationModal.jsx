import React, { useState } from 'react';
import { 
  QrCode, 
  Users, 
  Camera, 
  ArrowRight, 
  Check, 
  Download, 
  Upload,
  Fingerprint,
  FileText,
  CreditCard
} from 'lucide-react';
import axios from 'axios';

const QRVerificationModal = ({ isOpen, onClose }) => {
  const [qrMode, setQrMode] = useState('landing');
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [generatedQR, setGeneratedQR] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Credential types
  const credentialTypes = [
    {
      id: 'age',
      title: 'Age Verification',
      description: 'Prove you are over 18 without revealing your exact age',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'identity',
      title: 'Identity Proof',
      description: 'Verify your identity without sharing personal details',
      icon: Fingerprint,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'education',
      title: 'Education Certificate',
      description: 'Share your educational qualifications securely',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'employment',
      title: 'Employment Status',
      description: 'Verify your employment without exposing salary details',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleCredentialSelect = async (credential) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/v1/credentials/generate', {
        credentialType: credential.id,
        userId: 'demo_user_123' // In real app, get from auth context
      });
      
      setSelectedCredential(credential);
      setGeneratedQR(response.data.qrCodeDataURL);
    } catch (error) {
      console.error('Error generating credential:', error);
      alert('Failed to generate credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateQRScan = async () => {
    setIsScanning(true);
    try {
      // In real implementation, this would scan actual QR code
      // For demo, we'll verify the generated QR if available
      let qrData = generatedQR;
      
      if (!qrData) {
        // Generate a demo credential for testing
        const demoResponse = await axios.post('http://localhost:5000/api/v1/credentials/generate', {
          credentialType: 'age',
          userId: 'demo_user_scan'
        });
        qrData = demoResponse.data.qrCodeData;
      }

      const verifyResponse = await axios.post('http://localhost:5000/api/v1/credentials/verify', {
        qrCodeData: qrData
      });

      setVerificationResult(verifyResponse.data);
    } catch (error) {
      console.error('Error verifying credential:', error);
      setVerificationResult({
        success: false,
        message: 'Verification failed',
        details: 'Unable to verify credential. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const resetModal = () => {
    setQrMode('landing');
    setSelectedCredential(null);
    setGeneratedQR('');
    setVerificationResult(null);
    setIsScanning(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            Privacy-Preserving Identity Verification
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {qrMode === 'landing' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Choose Your Role</h3>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Our system works in both offline and online modes. Users can generate QR codes with 
                  digitally signed credentials, while verifiers can scan and validate them instantly.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* User Option */}
                <button
                  onClick={() => setQrMode('user')}
                  className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-8 hover:from-blue-600/30 hover:to-blue-800/30 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">I'm a User</h4>
                    <p className="text-blue-300 text-sm text-center">
                      Generate QR codes with your verified credentials to share with verifiers
                    </p>
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      Create Credential QR
                    </div>
                  </div>
                </button>

                {/* Verifier Option */}
                <button
                  onClick={() => setQrMode('verifier')}
                  className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-8 hover:from-purple-600/30 hover:to-purple-800/30 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">I'm a Verifier</h4>
                    <p className="text-purple-300 text-sm text-center">
                      Scan QR codes to verify credentials and validate identity proofs
                    </p>
                    <div className="flex items-center gap-2 text-purple-400 text-sm">
                      <ArrowRight className="w-4 h-4" />
                      Scan & Verify
                    </div>
                  </div>
                </button>
              </div>

              {/* Features Overview */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4 text-center">System Features</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Offline verification with RSA signatures</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Online verification with Polygon ID</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Zero-knowledge proof technology</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-300">Tamper-proof cryptographic security</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {qrMode === 'user' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setQrMode('landing')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="text-2xl font-bold text-white">Generate Credential QR Code</h3>
              </div>

              {!selectedCredential ? (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Select which credential you'd like to share. The QR code will contain a digitally 
                    signed proof that can be verified both offline and online.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {credentialTypes.map((credential) => {
                      const Icon = credential.icon;
                      return (
                        <button
                          key={credential.id}
                          onClick={() => handleCredentialSelect(credential)}
                          disabled={isLoading}
                          className={`bg-gradient-to-br ${credential.color}/20 border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${credential.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-white mb-2">{credential.title}</h4>
                              <p className="text-gray-400 text-sm">{credential.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {isLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-blue-400">Generating credential...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${selectedCredential.color} rounded-xl flex items-center justify-center`}>
                        <selectedCredential.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{selectedCredential.title}</h4>
                        <p className="text-gray-400 text-sm">QR Code Generated Successfully</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
                      {generatedQR ? (
                        <img src={generatedQR} alt="Generated QR Code" className="w-48 h-48" />
                      ) : (
                        <div className="text-center">
                          <div className="w-48 h-48 bg-black border-4 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                            <QrCode className="w-32 h-32 text-gray-600" />
                          </div>
                          <p className="text-gray-600 text-sm">
                            QR Code for {selectedCredential.title}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Credential Type:</span>
                        <span className="text-white">{selectedCredential.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Verification Mode:</span>
                        <span className="text-green-400">Offline + Online</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Expires:</span>
                        <span className="text-white">24 hours</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Security:</span>
                        <span className="text-green-400">RSA-2048 Signed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedCredential(null)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all"
                    >
                      Generate Another
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center">
                      <Download className="w-4 h-4" />
                      Save QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {qrMode === 'verifier' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setQrMode('landing')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="text-2xl font-bold text-white">Verify Credential QR Code</h3>
              </div>

              {!verificationResult ? (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Scan a QR code to verify credentials. Our system validates cryptographic signatures 
                    and checks expiry dates both offline and online.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                    <div className="w-48 h-48 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      {isScanning ? (
                        <div className="text-center">
                          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                          <p className="text-blue-400">Scanning...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-gray-500 mb-4 mx-auto" />
                          <p className="text-gray-500">Camera View</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={simulateQRScan}
                        disabled={isScanning}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto"
                      >
                        <Camera className="w-5 h-5" />
                        {isScanning ? 'Scanning...' : 'Start Camera Scan'}
                      </button>
                      
                      <div className="text-gray-400 text-sm">or</div>
                      
                      <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto">
                        <Upload className="w-5 h-5" />
                        Upload QR Image
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-600/10 rounded-2xl p-4 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-300 font-medium mb-1">Verification Modes</h4>
                        <p className="text-blue-200 text-sm">
                          <strong>Offline:</strong> Validates RSA signatures against pre-shared public keys<br/>
                          <strong>Online:</strong> Verifies zero-knowledge proofs against Polygon blockchain
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`rounded-2xl p-6 border ${
                    verificationResult.success 
                      ? 'bg-green-600/10 border-green-500/30' 
                      : 'bg-red-600/10 border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        verificationResult.success ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {verificationResult.success ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold mb-2 ${
                          verificationResult.success ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {verificationResult.message}
                        </h4>
                        <p className={`text-sm ${
                          verificationResult.success ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {verificationResult.details}
                        </p>
                      </div>
                    </div>

                    {verificationResult.success && verificationResult.credential && (
                      <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                        <h5 className="text-white font-medium mb-3">Verified Credential Details</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white">{verificationResult.credential.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Issuer:</span>
                            <span className="text-white">{verificationResult.credential.issuer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Issued:</span>
                            <span className="text-white">
                              {new Date(verificationResult.credential.issuedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expires:</span>
                            <span className="text-white">
                              {new Date(verificationResult.credential.expiresAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setVerificationResult(null);
                        setIsScanning(false);
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all"
                    >
                      Scan Another
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 justify-center">
                      <Download className="w-4 h-4" />
                      Save Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRVerificationModal;
