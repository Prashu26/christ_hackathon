import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Shield, 
  CheckCircle, 
  QrCode, 
  Smartphone, 
  Eye, 
  EyeOff,
  Upload,
  Camera,
  Fingerprint,
  Lock,
  Unlock,
  Database,
  Network,
  Globe,
  Zap,
  ArrowRight,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Star,
  Users,
  Settings,
  Copy,
  Check,
  Download,
  Share2,
  Layers,
  Brain,
  Cpu,
  Wifi,
  WifiOff,
  Key,
  CreditCard,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Heart,
  Plane,
  ShoppingCart,
  Home,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Info,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [demoState, setDemoState] = useState('idle'); // idle, running, completed
  const [currentDemo, setCurrentDemo] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [userProgress, setUserProgress] = useState({
    signup: false,
    verification: false,
    identity: false,
    usage: false
  });

  const mainSteps = [
    {
      id: 'signup',
      title: 'Sign Up & Register',
      subtitle: 'Create your secure digital identity account',
      icon: User,
      color: 'from-blue-500 to-indigo-600',
      description: 'Start your journey by creating a secure account. We use military-grade encryption to protect your data from the moment you sign up.',
      details: [
        'Choose a strong password or use biometric authentication',
        'Verify your email address for account security',
        'Set up two-factor authentication for added protection',
        'Accept privacy terms and understand your data rights'
      ],
      time: '2 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'verification',
      title: 'Document Verification',
      subtitle: 'Upload and verify your official documents',
      icon: FileText,
      color: 'from-green-500 to-emerald-600',
      description: 'Upload your government-issued documents for verification. Our AI-powered system ensures authenticity while keeping your data secure.',
      details: [
        'Take photos of government ID (passport, driver\'s license, etc.)',
        'AI scans and extracts information automatically',
        'Facial recognition matches your photo to your ID',
        'Documents are verified against government databases'
      ],
      time: '5 minutes',
      difficulty: 'Medium'
    },
    {
      id: 'identity',
      title: 'Identity Creation',
      subtitle: 'Generate your unique digital identity',
      icon: Shield,
      color: 'from-purple-500 to-pink-600',
      description: 'Your verified information is encrypted and stored on the blockchain, creating an immutable digital identity that only you control.',
      details: [
        'Data is encrypted using 256-bit AES encryption',
        'Identity hash is stored on blockchain network',
        'Private keys are generated and secured locally',
        'QR codes and digital certificates are created'
      ],
      time: '3 minutes',
      difficulty: 'Automatic'
    },
    {
      id: 'usage',
      title: 'Start Using',
      subtitle: 'Access services with your digital identity',
      icon: CheckCircle,
      color: 'from-orange-500 to-red-600',
      description: 'Use your digital identity anywhere. Share only what\'s needed using Zero-Knowledge Proofs while maintaining complete privacy.',
      details: [
        'Generate QR codes for instant verification',
        'Control what information to share',
        'Use offline when internet isn\'t available',
        'Track usage and maintain audit logs'
      ],
      time: 'Instant',
      difficulty: 'Easy'
    }
  ];

  const features = [
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Prove facts about yourself without revealing personal data',
      icon: Eye,
      demo: 'zkp',
      color: 'bg-purple-600'
    },
    {
      title: 'Blockchain Security',
      description: 'Immutable records secured by distributed ledger technology',
      icon: Database,
      demo: 'blockchain',
      color: 'bg-blue-600'
    },
    {
      title: 'Offline Functionality',
      description: 'Access your identity even without internet connection',
      icon: Wifi,
      demo: 'offline',
      color: 'bg-green-600'
    },
    {
      title: 'Biometric Authentication',
      description: 'Secure access using fingerprint, face, or voice recognition',
      icon: Fingerprint,
      demo: 'biometric',
      color: 'bg-red-600'
    }
  ];

  const useCases = [
    {
      category: 'Financial Services',
      icon: CreditCard,
      scenarios: [
        { title: 'Bank Account Opening', time: '2 minutes', traditional: '2-3 days' },
        { title: 'Loan Applications', time: '5 minutes', traditional: '1-2 weeks' },
        { title: 'Investment KYC', time: '3 minutes', traditional: '3-5 days' }
      ]
    },
    {
      category: 'Government Services',
      icon: Building,
      scenarios: [
        { title: 'Passport Renewal', time: '10 minutes', traditional: '4-6 weeks' },
        { title: 'Tax Filing', time: '15 minutes', traditional: '2-3 hours' },
        { title: 'Benefits Claims', time: '5 minutes', traditional: '2-4 weeks' }
      ]
    },
    {
      category: 'Healthcare',
      icon: Heart,
      scenarios: [
        { title: 'Medical Records Access', time: 'Instant', traditional: '1-3 days' },
        { title: 'Insurance Claims', time: '2 minutes', traditional: '2-4 weeks' },
        { title: 'Prescription Verification', time: '30 seconds', traditional: '5-10 minutes' }
      ]
    },
    {
      category: 'Education',
      icon: GraduationCap,
      scenarios: [
        { title: 'Degree Verification', time: 'Instant', traditional: '1-2 weeks' },
        { title: 'Course Enrollment', time: '2 minutes', traditional: '1-2 days' },
        { title: 'Transcript Sharing', time: '1 minute', traditional: '3-7 days' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How secure is my digital identity?',
      answer: 'Your digital identity uses military-grade 256-bit AES encryption and is stored across a decentralized blockchain network. Your private keys never leave your device, ensuring only you have control over your data.',
      category: 'Security'
    },
    {
      question: 'What happens if I lose my phone?',
      answer: 'Your digital identity is backed up securely in the cloud with end-to-end encryption. You can recover it on any device using your backup phrase and biometric authentication.',
      category: 'Recovery'
    },
    {
      question: 'Can I use it without internet?',
      answer: 'Yes! Your digital identity works completely offline. All verification happens locally on your device using cryptographic signatures that can be verified without an internet connection.',
      category: 'Functionality'
    },
    {
      question: 'How do Zero-Knowledge Proofs work?',
      answer: 'ZKPs allow you to prove facts (like being over 18) without revealing the actual data (your birth date). It\'s like proving you have a key without showing the key itself.',
      category: 'Technology'
    },
    {
      question: 'Is my personal data sold or shared?',
      answer: 'Never. We use a privacy-by-design approach where your personal data is encrypted and stored locally on your device. We cannot access, read, or share your personal information.',
      category: 'Privacy'
    },
    {
      question: 'How long does verification take?',
      answer: 'Initial document verification typically takes 2-5 minutes. Once verified, all future authentications are instant. Complex verifications may take up to 24 hours during high-demand periods.',
      category: 'Verification'
    }
  ];

  const techStack = [
    { name: 'Blockchain', description: 'Ethereum Layer 2 for immutable records', icon: Database },
    { name: 'Encryption', description: '256-bit AES + RSA-4096 cryptography', icon: Lock },
    { name: 'AI/ML', description: 'Document verification & fraud detection', icon: Brain },
    { name: 'Biometrics', description: 'Fingerprint, face & voice recognition', icon: Fingerprint },
    { name: 'Zero-Knowledge', description: 'zk-SNARKs for privacy-preserving proofs', icon: Eye },
    { name: 'Mobile First', description: 'Native iOS & Android applications', icon: Smartphone }
  ];

  // Simulation functions
  const startDemo = (demoType) => {
    setCurrentDemo(demoType);
    setDemoState('running');
    setSimulationStep(0);
    
    const steps = demoType === 'full' ? 4 : 3;
    const interval = setInterval(() => {
      setSimulationStep(prev => {
        if (prev >= steps - 1) {
          clearInterval(interval);
          setDemoState('completed');
          setTimeout(() => {
            setDemoState('idle');
            setCurrentDemo(null);
            setSimulationStep(0);
          }, 3000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const updateProgress = (step) => {
    setUserProgress(prev => ({
      ...prev,
      [step]: true
    }));
  };

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % mainSteps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mainSteps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            How It
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Works
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover the simple 4-step process to create your secure digital identity. 
            From signup to verification, we make it easy and secure.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <div className="text-2xl font-bold text-white">10 min</div>
              <div className="text-sm text-gray-400">Total Setup Time</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <div className="text-2xl font-bold text-white">256-bit</div>
              <div className="text-sm text-gray-400">Encryption Level</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-gray-400">Privacy Guaranteed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <div className="text-2xl font-bold text-white">195+</div>
              <div className="text-sm text-gray-400">Countries Supported</div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => startDemo('full')}
              disabled={demoState === 'running'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {demoState === 'running' ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {demoState === 'running' ? 'Demo Running...' : 'Watch Full Demo'}
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-semibold border border-white/20 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Process Steps */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Simple 4-Step Process
        </h2>

        {/* Step Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {mainSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = userProgress[step.id];
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? `bg-gradient-to-r ${step.color} text-white scale-105 shadow-2xl` 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-green-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold">Step {index + 1}</div>
                  <div className="text-sm opacity-80">{step.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Details */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(mainSteps[activeStep].icon, { 
                  className: "w-12 h-12 text-blue-400" 
                })}
                <div>
                  <h3 className="text-3xl font-bold text-white">{mainSteps[activeStep].title}</h3>
                  <p className="text-gray-400">{mainSteps[activeStep].subtitle}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {mainSteps[activeStep].description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <Clock className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-white font-medium">{mainSteps[activeStep].time}</div>
                  <div className="text-gray-400 text-sm">Time Required</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <Star className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-white font-medium">{mainSteps[activeStep].difficulty}</div>
                  <div className="text-gray-400 text-sm">Difficulty Level</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">What happens:</h4>
                {mainSteps[activeStep].details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateProgress(mainSteps[activeStep].id)}
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all ${
                  userProgress[mainSteps[activeStep].id]
                    ? 'bg-green-600 text-white'
                    : `bg-gradient-to-r ${mainSteps[activeStep].color} hover:opacity-90 text-white`
                }`}
              >
                {userProgress[mainSteps[activeStep].id] ? '✓ Completed' : `Try Step ${activeStep + 1}`}
              </button>
            </div>
          </div>

          {/* Interactive Demo Area */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            {/* Demo based on active step */}
            {activeStep === 0 && ( // Signup Demo
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Account Registration</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  />
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-colors">
                      <Fingerprint className="w-4 h-4 mx-auto" />
                    </button>
                    <input
                      type="password"
                      placeholder="Password"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium">
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {activeStep === 1 && ( // Verification Demo
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Document Upload</h4>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">Drop your ID document here or click to browse</p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Take Photo
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Passport</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Driver's License</div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && ( // Identity Creation Demo
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Identity Generation</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                    <span className="text-gray-300">Encrypting Data</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                    <span className="text-gray-300">Blockchain Storage</span>
                    <div className="animate-spin">
                      <Loader className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                    <span className="text-gray-300">Generating Keys</span>
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 text-center border border-purple-500/20">
                  <Shield className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <div className="text-white font-bold">Digital Identity Created!</div>
                  <div className="text-gray-300 text-sm mt-1">Your unique ID: DID:2024:IND:7891</div>
                </div>
              </div>
            )}

            {activeStep === 3 && ( // Usage Demo
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Ready to Use</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl p-4 text-center transition-colors">
                    <QrCode className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Generate QR</div>
                  </button>
                  <button className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-xl p-4 text-center transition-colors">
                    <Share2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Share Identity</div>
                  </button>
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 rounded-xl p-4 text-center transition-colors">
                    <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Privacy Control</div>
                  </button>
                  <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/20 rounded-xl p-4 text-center transition-colors">
                    <Settings className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-white text-sm">Manage Settings</div>
                  </button>
                </div>
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 text-center border border-green-500/20">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <div className="text-white font-bold">You're All Set!</div>
                  <div className="text-gray-300 text-sm mt-1">Start using your digital identity anywhere</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Features Demo */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Powerful Features in Action
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300 group cursor-pointer"
                onClick={() => startDemo(feature.demo)}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4 text-sm">{feature.description}</p>
                <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm">
                  <Play className="w-4 h-4" />
                  Try Demo
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Use Cases Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Real-World Impact
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          See how digital identity transforms traditional processes across different industries
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-8 h-8 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">{useCase.category}</h3>
                </div>
                
                <div className="space-y-4">
                  {useCase.scenarios.map((scenario, sIndex) => (
                    <div key={sIndex} className="bg-white/5 rounded-xl p-4">
                      <div className="text-white font-medium text-sm mb-2">{scenario.title}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-green-400 font-bold text-lg">{scenario.time}</div>
                          <div className="text-green-300 text-xs">With Digital ID</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="text-right">
                          <div className="text-red-400 font-bold text-lg">{scenario.traditional}</div>
                          <div className="text-red-300 text-xs">Traditional Way</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Built on Advanced Technology
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{tech.name}</h3>
                <p className="text-gray-400 text-sm">{tech.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/20 rounded-xl p-2">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{faq.question}</h3>
                    <div className="text-blue-400 text-sm">{faq.category}</div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedFaq === index ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-6">
                  <div className="bg-white/5 rounded-xl p-4 ml-12">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo Status */}
      {demoState === 'running' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md mx-4 text-center border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {currentDemo === 'full' ? (
                React.createElement(mainSteps[simulationStep]?.icon || User, { 
                  className: "w-8 h-8 text-white" 
                })
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentDemo === 'full' ? `Step ${simulationStep + 1}: ${mainSteps[simulationStep]?.title}` : 'Feature Demo'}
            </h3>
            <p className="text-gray-300 mb-6">
              {currentDemo === 'full' 
                ? mainSteps[simulationStep]?.subtitle 
                : 'Demonstrating feature capabilities...'
              }
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${((simulationStep + 1) / (currentDemo === 'full' ? 4 : 3)) * 100}%`}}
              ></div>
            </div>
            <p className="text-gray-400 text-sm">
              {currentDemo === 'full' ? `${simulationStep + 1} of 4 steps completed` : 'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have already created their secure digital identity.
            The future of identification is here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center gap-2 justify-center">
              <User className="w-5 h-5" />
              Create Your Identity
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 transition-all flex items-center gap-2 justify-center">
              <MessageCircle className="w-5 h-5" />
              Talk to Expert
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>10 min setup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;