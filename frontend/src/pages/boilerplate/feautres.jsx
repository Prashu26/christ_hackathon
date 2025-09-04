import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Zap, 
  Globe, 
  Smartphone, 
  Lock, 
  Unlock,
  QrCode,
  Fingerprint,
  Users,
  Cloud,
  CloudOff,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Star,
  Cpu,
  Database,
  Wifi,
  WifiOff,
  CreditCard,
  FileText,
  Settings,
  Camera,
  Download,
  Upload,
  Layers,
  Network
} from 'lucide-react';
import QRVerificationModal from '../../components/QRVerificationModal';

const FeaturesPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [demoStates, setDemoStates] = useState({
    privacy: { visible: false, animating: false },
    offline: { status: 'online', syncing: false },
    verification: { step: 0, verifying: false },
    zkp: { proving: false, verified: false }
  });

  const mainFeatures = [
    {
      id: 'security',
      icon: Shield,
      title: 'Military-Grade Security',
      subtitle: '256-bit encryption with blockchain immutability',
      description: 'Your identity is protected by the same cryptographic standards used by banks and governments. Every piece of data is encrypted and stored across a decentralized network, making it virtually impossible to hack or tamper with.',
      color: 'from-blue-500 to-indigo-600',
      stats: [
        { label: 'Encryption Level', value: '256-bit AES' },
        { label: 'Hash Algorithm', value: 'SHA-256' },
        { label: 'Blockchain Network', value: 'Ethereum L2' }
      ]
    },
    {
      id: 'privacy',
      icon: Eye,
      title: 'Zero-Knowledge Privacy',
      subtitle: 'Prove who you are without revealing personal data',
      description: 'Share only what you need to share. Our Zero-Knowledge Proof technology lets you verify your age, location, or credentials without exposing the actual data. You stay private while remaining verifiable.',
      color: 'from-purple-500 to-pink-600',
      stats: [
        { label: 'Data Shared', value: '0% Personal Info' },
        { label: 'Proof Generation', value: '<2 seconds' },
        { label: 'Verification Time', value: 'Instant' }
      ]
    },
    {
      id: 'offline',
      icon: Zap,
      title: 'Works Everywhere',
      subtitle: 'Access your identity online or offline',
      description: 'Your digital identity works even without internet. Cryptographic signatures ensure your credentials remain valid and verifiable whether you\'re in a remote village or a bustling city.',
      color: 'from-green-500 to-emerald-600',
      stats: [
        { label: 'Offline Capability', value: '100% Functional' },
        { label: 'Sync Time', value: '<5 seconds' },
        { label: 'Storage Required', value: '2MB' }
      ]
    },
    {
      id: 'universal',
      icon: Globe,
      title: 'Universal Acceptance',
      subtitle: 'One identity that works across borders',
      description: 'No more carrying multiple documents or filling endless forms. Your digital identity is recognized globally, making travel, banking, and official procedures seamless across countries.',
      color: 'from-orange-500 to-red-600',
      stats: [
        { label: 'Countries Supported', value: '195+' },
        { label: 'Languages', value: '50+' },
        { label: 'Partner Organizations', value: '10,000+' }
      ]
    }
  ];

  const technicalFeatures = [
    {
      icon: Fingerprint,
      title: 'Biometric Authentication',
      description: 'Secure login with fingerprint, face, or voice recognition',
      demo: 'biometric'
    },
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Instant QR codes for quick identity verification',
      demo: 'qr'
    },
    {
      icon: Database,
      title: 'Smart Loan System',
      description: 'Decentralized loan application with KYC verification, automatic fund disbursement, and on-chain repayment tracking.',
      demo: 'loan'
    },
    {
      icon: Shield,
      title: 'Smart Insurance System',
      description: 'Blockchain-based insurance with instant claims processing and automated payouts.',
      demo: 'insurance'
    },    
 
    {
      icon: Network,
      title: 'Secure Document Storage',
      description: 'Encrypted document storage with password protection and secure access',
      demo: 'storage'
    },
    {
      icon: Layers,
      title: 'Multi-Layer Security',
      description: 'Multiple security layers protect against all threat vectors',
      demo: 'layers'
    }
  ];

  const useCases = [
    {
      icon: CreditCard,
      title: 'Banking & Finance',
      description: 'Instant KYC verification for bank accounts, loans, and investments',
      benefit: 'Reduce verification time from days to minutes'
    },
    {
      icon: FileText,
      title: 'Government Services',
      description: 'Access passports, licenses, and certificates digitally',
      benefit: 'Eliminate paperwork and reduce processing time by 90%'
    },
    {
      icon: Users,
      title: 'Healthcare',
      description: 'Secure medical records accessible to authorized providers',
      benefit: 'Better care coordination and reduced medical errors'
    },
    {
      icon: Smartphone,
      title: 'Travel & Tourism',
      description: 'Seamless border crossing and hotel check-ins',
      benefit: 'Skip long queues and enjoy hassle-free travel'
    }
  ];

  const handleQRDemo = () => {
    navigate('/generate-qr');
  };

  const handleLoanDemo = () => {
    navigate('/loan');
  };

  const handleInsuranceDemo = () => {
    navigate('/insurance');
  };

  const handleStorageDemo = () => {
    navigate('/storage');
  };

  const handleDemo = (demo) => {
    switch (demo) {
      case 'insurance':
        navigate('/insurance');
        break;
      case 'interop':
        navigate('/storage');
        break;
      default:
        break;
    }
  };

  // Privacy Demo
  const togglePrivacyDemo = () => {
    setDemoStates(prev => ({
      ...prev,
      privacy: { visible: !prev.privacy.visible, animating: true }
    }));
    setTimeout(() => {
      setDemoStates(prev => ({
        ...prev,
        privacy: { ...prev.privacy, animating: false }
      }));
    }, 500);
  };

  // Offline Demo
  const toggleOfflineDemo = () => {
    const newStatus = demoStates.offline.status === 'online' ? 'offline' : 'online';
    setDemoStates(prev => ({
      ...prev,
      offline: { status: newStatus, syncing: newStatus === 'online' }
    }));
    
    if (newStatus === 'online') {
      setTimeout(() => {
        setDemoStates(prev => ({
          ...prev,
          offline: { ...prev.offline, syncing: false }
        }));
      }, 2000);
    }
  };

  // Verification Demo
  const startVerificationDemo = () => {
    setDemoStates(prev => ({
      ...prev,
      verification: { step: 0, verifying: true }
    }));
    
    const steps = [1, 2, 3, 4];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setDemoStates(prev => ({
          ...prev,
          verification: { 
            step: step, 
            verifying: index < steps.length - 1 
          }
        }));
      }, (index + 1) * 1000);
    });
  };

  // ZKP Demo
  const startZKPDemo = () => {
    setDemoStates(prev => ({
      ...prev,
      zkp: { proving: true, verified: false }
    }));
    
    setTimeout(() => {
      setDemoStates(prev => ({
        ...prev,
        zkp: { proving: false, verified: true }
      }));
    }, 2000);
    
    setTimeout(() => {
      setDemoStates(prev => ({
        ...prev,
        zkp: { proving: false, verified: false }
      }));
    }, 5000);
  };

  // Auto-rotate main features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainFeatures.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Revolutionary
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Features
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how our cutting-edge technology transforms digital identity management 
            with unparalleled security, privacy, and convenience.
          </p>
        </div>
      </div>

      {/* Main Features Showcase */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Navigation */}
          <div className="space-y-4">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-r ${feature.color} text-white scale-105 shadow-2xl` 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-8 h-8 mt-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className={`text-sm mb-3 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        {feature.subtitle}
                      </p>
                      {isActive && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {feature.stats.map((stat, i) => (
                            <div key={i} className="text-center">
                              <div className="text-lg font-bold">{stat.value}</div>
                              <div className="text-xs opacity-80">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Demo Area */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {mainFeatures[activeFeature].title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {mainFeatures[activeFeature].description}
              </p>
            </div>

            {/* Feature-specific Demo */}
            {activeFeature === 0 && ( // Security Demo
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Encryption Status</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Encryption</span>
                      <span className="text-green-400">✓ AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain Hash</span>
                      <span className="text-green-400">✓ SHA-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Security</span>
                      <span className="text-green-400">✓ Multi-Node</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeature === 1 && ( // Privacy Demo
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Privacy Controls</span>
                    <button
                      onClick={togglePrivacyDemo}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-white text-sm transition-colors"
                    >
                      {demoStates.privacy.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {demoStates.privacy.visible ? 'Hide' : 'Reveal'} Data
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age Verification</span>
                      <span className="text-green-400">✓ Over 18 (ZKP)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Identity Data</span>
                      <span className={`transition-all duration-500 ${
                        demoStates.privacy.visible ? 'text-white' : 'text-gray-600'
                      }`}>
                        {demoStates.privacy.visible ? 'John Doe, 25, NYC' : '•••••••••••••••'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credentials Shared</span>
                      <span className="text-yellow-400">0% Personal Info</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={startZKPDemo}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-xl text-white font-medium transition-all"
                >
                  {demoStates.zkp.proving ? 'Generating Proof...' : 
                   demoStates.zkp.verified ? '✓ Proof Verified' : 'Demo Zero-Knowledge Proof'}
                </button>
              </div>
            )}

            {activeFeature === 2 && ( // Offline Demo
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {demoStates.offline.status === 'online' ? 
                        <Wifi className="w-5 h-5 text-green-400" /> : 
                        <WifiOff className="w-5 h-5 text-red-400" />
                      }
                      <span className="text-white font-medium">
                        Connection: {demoStates.offline.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <button
                      onClick={toggleOfflineDemo}
                      className={`px-3 py-1 rounded-lg text-white text-sm transition-colors ${
                        demoStates.offline.status === 'online' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Go {demoStates.offline.status === 'online' ? 'Offline' : 'Online'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Identity Access</span>
                      <span className="text-green-400">✓ Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verification</span>
                      <span className="text-green-400">✓ Functional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sync Status</span>
                      <span className={demoStates.offline.syncing ? 'text-yellow-400' : 'text-green-400'}>
                        {demoStates.offline.syncing ? 'Syncing...' : '✓ Up to Date'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeature === 3 && ( // Universal Demo
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">Global Recognition</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">195+</div>
                      <div className="text-xs text-gray-400">Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-xs text-gray-400">Languages</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={startVerificationDemo}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-4 py-2 rounded-xl text-white font-medium transition-all"
                  disabled={demoStates.verification.verifying}
                >
                  {demoStates.verification.verifying ? `Verifying... Step ${demoStates.verification.step}/4` : 
                   demoStates.verification.step === 4 ? '✓ Globally Verified' : 'Demo Global Verification'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Advanced Technical Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <Icon className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <button 
                  onClick={
                    feature.demo === 'qr' ? handleQRDemo : 
                    feature.demo === 'loan' ? handleLoanDemo : 
                    feature.demo === 'insurance' ? handleInsuranceDemo :
                    feature.demo === 'storage' ? handleStorageDemo :
                    undefined
                  }
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <Play className="w-4 h-4" />
                  Try Demo
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Real-World Applications
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300"
              >
                <Icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{useCase.description}</p>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <p className="text-green-400 text-xs font-medium">{useCase.benefit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Digital Identity?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have already secured their digital future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center gap-2 justify-center">
              <Fingerprint className="w-5 h-5" />
              Create Your Identity
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 transition-all flex items-center gap-2 justify-center">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* QR Verification Modal */}
      <QRVerificationModal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
      />
    </div>
  );
};

export default FeaturesPage;