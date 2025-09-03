import React, { useState, useEffect } from 'react';
import { Camera, QrCode, Shield, Zap, Eye, EyeOff, Users, Lock, Globe, Smartphone } from 'lucide-react';

const HomePage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [particles, setParticles] = useState([]);
  const [userCount, setUserCount] = useState(12847);

  const features = [
    { 
      icon: Shield, 
      title: "Tamper-Proof Security", 
      desc: "Blockchain-secured identity that can't be faked or modified",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600"
    },
    { 
      icon: Eye, 
      title: "Privacy-First Design", 
      desc: "Share only what's needed with Zero-Knowledge Proofs",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-600"
    },
    { 
      icon: Zap, 
      title: "Works Offline", 
      desc: "Access your identity even without internet connection",
      color: "bg-green-500",
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      icon: Globe, 
      title: "Universal Access", 
      desc: "One identity that works everywhere, no borders",
      color: "bg-orange-500",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate growing user count
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  const handleActionClick = (action) => {
    if (action === 'scan') {
      setShowDemo(true);
      // Simulate scanning process
      setTimeout(() => {
        alert('🎉 QR Code scanned successfully! Identity verified.');
        setShowDemo(false);
      }, 2000);
    } else if (action === 'create') {
      alert('🔗 Generating your secure QR identity...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-white opacity-20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 pt-20">
        
        {/* Header with live stats */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">{userCount.toLocaleString()} verified users</span>
          </div>

          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Decentralized
            <br />
            Digital Identity
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Take control of your digital identity with blockchain technology. 
            Secure, private, and accessible anywhere in the world.
          </p>
        </div>

        {/* Interactive Feature Showcase */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = currentFeature === index;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`p-4 rounded-2xl transition-all duration-500 transform ${
                    isActive 
                      ? `bg-gradient-to-r ${feature.gradient} scale-105 shadow-2xl` 
                      : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                  }`}
                  onMouseEnter={() => setIsHovering(index)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {feature.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature Description */}
          <div className="text-center bg-white/5 backdrop-blur-md rounded-3xl p-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${features[currentFeature].gradient} mb-4`}>
              {React.createElement(features[currentFeature].icon, { className: "w-8 h-8 text-white" })}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {features[currentFeature].title}
            </h3>
            <p className="text-gray-300 text-lg">
              {features[currentFeature].desc}
            </p>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <button
            onClick={() => handleActionClick('scan')}
            disabled={showDemo}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseEnter={() => setIsHovering('scan')}
            onMouseLeave={() => setIsHovering(null)}
          >
            {/* <div className="flex items-center gap-3">
              <Camera className={`w-6 h-6 transition-transform ${showDemo ? 'animate-pulse' : ''}`} />
              <span>{showDemo ? 'Scanning...' : 'Scan QR Code'}</span>
            </div> */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-3">
              <Camera className={`w-6 h-6 transition-transform ${showDemo ? 'animate-pulse' : ''}`} />
              <span>{showDemo ? 'Scanning...' : 'Scan QR Code'}</span>
            </div>
          </button>

          <button
            onClick={() => handleActionClick('create')}
            className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            onMouseEnter={() => setIsHovering('create')}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-3">
              <QrCode className="w-6 h-6" />
              <span>Create Identity</span>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6">
            <Lock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">256-bit</div>
            <div className="text-gray-400">Encryption</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6">
            <Smartphone className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-gray-400">Mobile Ready</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-gray-400">Countries</div>
          </div>
        </div>

        {/* Demo Modal */}
        {showDemo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Scanning QR Code</h3>
              <p className="text-gray-600 mb-4">Please wait while we verify the identity...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;