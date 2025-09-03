import { useNavigate } from 'react-router-dom'
import { User, Shield, ArrowLeft } from 'lucide-react'

function GenerateQR() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate('/features')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Features
      </button>

      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-5xl font-bold mb-4 text-center">
          Privacy-Preserving Identity Verification
        </h1>
        <p className="text-xl mb-12 text-center opacity-90 max-w-2xl">
          Secure, decentralized identity verification using QR codes with offline and online modes
        </p>
      
      <div className="flex gap-8 flex-wrap justify-center">
        <div 
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/20 min-w-[280px]"
          onClick={(e) => {
            e.preventDefault();
            console.log('User option clicked - navigating to /user');
            navigate('/user');
          }}
        >
          <div className="text-6xl mb-4">
            <User size={64} />
          </div>
          <h3 className="text-2xl font-bold mb-2">User</h3>
          <p className="opacity-80">
            Generate verifiable credentials and create QR codes for identity proof
          </p>
        </div>
        
        <div
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/20 min-w-[280px]"
          onClick={(e) => {
            e.preventDefault();
            console.log('Verifier option clicked - navigating to /verify first');
            navigate('/verify');
          }}
        >
          <div className="text-6xl mb-4">
            <Shield size={64} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Verifier</h3>
          <p className="opacity-80">
            Scan and verify QR codes to authenticate user credentials instantly
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}

export default GenerateQR
