import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, QrCode, Users, Zap, Github, Twitter, Linkedin, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const scaleOnHover = {
    scale: 1.05,
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navbar */}
      <motion.nav
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-lg z-50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Decentralized ID</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#demo" className="text-gray-700 hover:text-blue-600 transition-colors">Demo</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            className="mb-8"
            {...fadeInUp}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🔐 Decentralized Digital Identity, Anywhere
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Privacy-preserving, tamper-proof, and even works offline with zero-knowledge proofs.
            </p>
          </motion.div>
          <Link to="/login-otp">
            <motion.button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl"
              whileHover={scaleOnHover}
              {...fadeInUp}
            >
              Get Started
            </motion.button>
          </Link>
          <motion.div
            className="mt-12 flex justify-center"
            {...fadeInUp}
          >
            <div className="flex items-center space-x-8">
              <QrCode className="h-16 w-16 text-blue-600" />
              <ArrowRight className="h-8 w-8 text-gray-400" />
              <Shield className="h-16 w-16 text-purple-600" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
            {...fadeInUp}
          >
            Key Features
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg"
              variants={staggerItem}
            >
              <QrCode className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Offline Verification</h3>
              <p className="text-gray-600">QR handshake for instant verification without internet.</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg"
              variants={staggerItem}
            >
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Zero-Knowledge Proofs</h3>
              <p className="text-gray-600">Privacy-preserving checks that reveal nothing unnecessary.</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg"
              variants={staggerItem}
            >
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community-Friendly</h3>
              <p className="text-gray-600">Works seamlessly in low connectivity environments.</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl shadow-lg"
              variants={staggerItem}
            >
              <Zap className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Future-Ready</h3>
              <p className="text-gray-600">Integrated with Polygon ID for advanced capabilities.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
            {...fadeInUp}
          >
            How It Works
          </motion.h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-16">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Issuer</h3>
              <p className="text-gray-600">Creates and issues digital credentials.</p>
            </motion.div>
            <ArrowRight className="h-8 w-8 text-gray-400 hidden md:block" />
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Holder</h3>
              <p className="text-gray-600">Stores and manages their identity securely.</p>
            </motion.div>
            <ArrowRight className="h-8 w-8 text-gray-400 hidden md:block" />
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifier</h3>
              <p className="text-gray-600">Verifies credentials without compromising privacy.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            {...fadeInUp}
          >
            Ready to Secure Your Digital Identity?
          </motion.h2>
          <Link to="/login-otp">
            <motion.button
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl"
              whileHover={scaleOnHover}
              {...fadeInUp}
            >
              Get Started Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            className="mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            © 2023 Decentralized Digital Identity. All rights reserved.
          </motion.p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-blue-400 transition-colors">
              <Github className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
