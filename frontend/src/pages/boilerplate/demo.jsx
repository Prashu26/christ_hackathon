import React from "react";
import { motion } from "framer-motion";
import { QrCode, Lock, CheckCircle, EyeOff } from "lucide-react";

const DemoPage = () => {
  return (
    <div className="w-full min-h-screen text-gray-200 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center px-6 py-20">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 drop-shadow-lg"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🔐 ZKP QR Verifier
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-xl max-w-3xl text-pink-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Prove your identity without revealing it.  
          A <span className="font-semibold">Zero Knowledge Proof</span> powered QR Code system — secure, private, and trustless. ⚡
        </motion.p>
      </div>

      {/* Steps Section */}
      <div className="relative max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-10">
        {[
          { icon: <QrCode className="w-10 h-10 text-pink-400" />, title: "1. Generate", desc: "User generates a ZKP-based QR code with hidden credentials." },
          { icon: <Lock className="w-10 h-10 text-purple-400" />, title: "2. Scan", desc: "Verifier scans the QR without seeing private information." },
          { icon: <CheckCircle className="w-10 h-10 text-green-400" />, title: "3. Verify", desc: "System confirms proof validity without exposing secrets." },
        ].map((step, i) => (
          <motion.div
            key={i}
            className="p-6 rounded-2xl backdrop-blur-lg bg-white/5 border border-pink-500/40 hover:shadow-pink-500/40 transition flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.2 }}
          >
            {step.icon}
            <h3 className="mt-4 text-xl font-semibold text-fuchsia-300">{step.title}</h3>
            <p className="mt-2 text-gray-300">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Demo Mockup */}
      <motion.div
        className="relative max-w-3xl mx-auto bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl shadow-lg p-10 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-pink-400 mb-6">🚀 Demo Preview</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* QR Code image */}
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?data=You%20are%2018%2B%20Verified!&size=200x200"
            alt="QR Code Demo"
            className="w-48 h-48 rounded-lg shadow-lg border border-pink-400/40"
          />
          <div className="bg-black/40 border border-pink-400/40 rounded-xl p-6 w-64">
            <EyeOff className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Private Data: <span className="text-red-400">Hidden</span>
            </p>
            <p className="text-gray-300 mb-4">
              Verification Status: <span className="text-green-400">Valid ✅</span>
            </p>
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 shadow-md text-white font-semibold hover:scale-105 transition">
              Scan Another
            </button>
          </div>
        </div>
      </motion.div>

      {/* Facts Section */}
      <motion.div
        className="max-w-5xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="bg-white/5 border border-fuchsia-500/30 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-pink-400 mb-4">Why ZKP?</h3>
          <ul className="space-y-3 text-gray-300">
            <li>✅ Prove you’re 18+ without revealing DOB.</li>
            <li>✅ Authenticate ID without exposing numbers.</li>
            <li>✅ Perfect for banking, healthcare, voting.</li>
          </ul>
        </div>
        <div className="bg-white/5 border border-purple-500/30 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">Why QR Codes?</h3>
          <ul className="space-y-3 text-gray-300">
            <li>✅ Easy to scan on any device 📱</li>
            <li>✅ Offline-friendly for secure environments.</li>
            <li>✅ Fast onboarding for real-world applications.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoPage;
