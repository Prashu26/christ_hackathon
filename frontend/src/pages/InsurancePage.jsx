import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, DollarSign, Calendar, FileText, AlertCircle, CheckCircle, Clock, X, Wallet } from 'lucide-react';
import axios from 'axios';
import InsuranceApplication from '../components/InsuranceApplication';
import Web3Integration from '../components/Web3Integration';
import { insuranceContract, web3Utils } from '../utils/web3';
import InsuranceClaim from '../components/InsuranceClaim';
import MetaMaskUtils from '../utils/metamask';

function InsurancePage() {
  const navigate = useNavigate()
  
  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = storedUser._id;
  
  // State management
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('0')
  const [currentNetwork, setCurrentNetwork] = useState(null)
  const [web3Account, setWeb3Account] = useState('')
  const [web3Balance, setWeb3Balance] = useState('0')
  const [insuranceRequests, setInsuranceRequests] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState('application')

  // Connect MetaMask wallet using utility
  const connectWallet = async () => {
    console.log('🔗 Connect wallet clicked')
    setLoading(true)
    setError('')
    
    try {
      const result = await MetaMaskUtils.connect({
        timeout: 30000,
        expectedChainId: null, // Accept any network for now
        autoSwitchNetwork: false
      })
      
      if (result.success) {
        console.log('✅ Wallet connected successfully:', result)
        setWalletAddress(result.address)
        setWalletBalance(result.balance)
        setCurrentNetwork(result.network)
        setWalletConnected(true)
        setError('')
        
        // Set up event listeners for account and network changes
        MetaMaskUtils.onAccountsChanged((accounts) => {
          if (accounts.length === 0) {
            disconnectWallet()
          } else if (accounts[0] !== walletAddress) {
            setWalletAddress(accounts[0])
            // Refresh balance for new account
            MetaMaskUtils.getBalance(accounts[0]).then(setWalletBalance)
          }
        })
        
        MetaMaskUtils.onChainChanged((chainId) => {
          // Refresh network info
          MetaMaskUtils.getCurrentNetwork().then(setCurrentNetwork)
        })
        
        if (userId) {
          loadUserData().catch(console.error)
        }
      } else {
        console.error('❌ Connection failed:', result.error)
        setError(result.error)
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setError(`Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress('')
    setWalletBalance('0')
    setCurrentNetwork(null)
    setWeb3Account('')
    setWeb3Balance('0')
    setError('')
    
    // Remove event listeners
    MetaMaskUtils.removeAllListeners()
    console.log('Wallet disconnected')
  }

  // Auto-connect wallet on page load if previously connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (MetaMaskUtils.isInstalled()) {
        try {
          // Add small delay to avoid race conditions
          await new Promise(resolve => setTimeout(resolve, 100))
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const address = accounts[0]
            const balance = await MetaMaskUtils.getBalance(address)
            const network = await MetaMaskUtils.getCurrentNetwork()
            
            setWalletAddress(address)
            setWalletBalance(balance)
            setCurrentNetwork(network)
            setWalletConnected(true)
            
            console.log('Auto-connected to wallet:', address, 'Network:', network?.name)
            
            // Set up event listeners
            MetaMaskUtils.onAccountsChanged((accounts) => {
              if (accounts.length === 0) {
                disconnectWallet()
              } else if (accounts[0] !== walletAddress) {
                setWalletAddress(accounts[0])
                MetaMaskUtils.getBalance(accounts[0]).then(setWalletBalance)
              }
            })
            
            MetaMaskUtils.onChainChanged((chainId) => {
              MetaMaskUtils.getCurrentNetwork().then(setCurrentNetwork)
            })
          }
        } catch (error) {
          console.log('Auto-connection failed:', error)
        }
      }
    }

    // Use requestIdleCallback for better performance if available
    if (window.requestIdleCallback) {
      window.requestIdleCallback(checkWalletConnection)
    } else {
      setTimeout(checkWalletConnection, 0)
    }
  }, [])

  // Load user data on component mount
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/insurance/status/${userId}`);
      
      if (response.data.success) {
        setInsuranceRequests(response.data.insuranceRequests || []);
      }
    } catch (error) {
      console.error('Error loading insurance data:', error);
      setError('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Web3 wallet connection
  const handleWeb3Connection = (connectionData) => {
    setWeb3Account(connectionData.account);
    setWeb3Balance(connectionData.balance);
    setWalletConnected(connectionData.connected);
    
    if (connectionData.connected && !walletAddress) {
      setWalletAddress(connectionData.account);
    }
  };

  // Handle successful application submission
  const handleApplicationSubmit = (requestData) => {
    // Refresh insurance requests after successful submission
    loadUserData()
    setCurrentView('dashboard')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
      {/* Back Button */}
      <button 
        className="absolute top-8 left-8 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/20 flex items-center gap-2"
        onClick={() => navigate('/features')}
      >
        <ArrowLeft size={20} /> Back to Features
      </button>

      {/* Header */}
      <div className="text-center mb-12 pt-16">
        <h1 className="text-4xl font-bold mb-4">Smart Insurance System</h1>
        <p className="text-lg opacity-90">Decentralized insurance with blockchain verification</p>
      </div>

      {/* Wallet Connection */}
      {!walletConnected ? (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <Wallet className="mx-auto mb-4 text-blue-400" size={64} />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-white/80 mb-6">
              Connect your MetaMask wallet to apply for insurance or manage your policies
            </p>
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-medium">Connection Failed</span>
                </div>
                <p>{error}</p>
                <div className="mt-3 text-xs text-red-200">
                  <p>💡 Troubleshooting steps:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {error.includes('not installed') ? (
                      <>
                        <li>Install MetaMask from <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">metamask.io</a></li>
                        <li>Refresh this page after installation</li>
                      </>
                    ) : (
                      <>
                        <li>Make sure MetaMask extension is enabled in your browser</li>
                        <li>Unlock MetaMask if it's locked</li>
                        <li>Check if MetaMask popup is blocked by your browser</li>
                        <li>Close any pending MetaMask connection requests</li>
                        <li>Try refreshing the page</li>
                        <li>Restart your browser if the issue persists</li>
                      </>
                    )}
                  </ul>
                  <div className="mt-2 p-2 bg-black/20 rounded text-xs">
                    <p className="font-medium">Debug info (check browser console for more details):</p>
                    <p>• Press F12 to open developer tools</p>
                    <p>• Look for error messages in the Console tab</p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Connecting...' : error ? 'Retry Connection' : 'Connect MetaMask'}
            </button>
            
            {loading && (
              <p className="mt-3 text-sm text-white/60">
                Please check MetaMask for a connection popup...
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Wallet Info */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Wallet className="text-green-400" size={24} />
                  <div>
                    <p className="font-medium">Wallet Connected</p>
                    <p className="text-sm text-white/60">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                >
                  Disconnect
                </button>
              </div>
              
              {/* Additional wallet info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-400" />
                  <span className="text-sm text-white/80">Balance: {walletBalance} ETH</span>
                </div>
                {currentNetwork && (
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-purple-400" />
                    <span className="text-sm text-white/80">Network: {currentNetwork.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentView('application')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  currentView === 'application' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Apply for Insurance
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  currentView === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                My Insurance Status
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-6xl mx-auto mb-8">
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
                {error}
              </div>
            </div>
          )}

          {/* Main Content */}
          {currentView === 'application' ? (
            <InsuranceApplication 
              walletAddress={walletAddress}
              onApplicationSubmit={handleApplicationSubmit}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Insurance Status</h2>
                
                {!userId ? (
                  <div className="text-center py-12">
                    <p className="text-white/60 text-lg mb-6">Please log in to view your insurance applications</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Go to Login
                    </button>
                  </div>
                ) : insuranceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/60 text-lg mb-6">No insurance applications found</p>
                    <button
                      onClick={() => setCurrentView('application')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Apply for Insurance
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insuranceRequests.map((request, index) => (
                      <div key={request.requestId || index} className={`p-6 rounded-xl border ${
                        request.status === 'approved' ? 'bg-green-500/20 border-green-500/50' :
                        request.status === 'rejected' ? 'bg-red-500/20 border-red-500/50' :
                        'bg-yellow-500/20 border-yellow-500/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {request.insuranceType.charAt(0).toUpperCase() + request.insuranceType.slice(1)} Insurance
                            </h3>
                            <p className="text-white/80">Request ID: {request.requestId}</p>
                            <p className="text-white/80">Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                            request.status === 'approved' ? 'bg-green-500/30 text-green-300' :
                            request.status === 'rejected' ? 'bg-red-500/30 text-red-300' :
                            'bg-yellow-500/30 text-yellow-300'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Coverage Details</h4>
                            <p className="text-white/80">Coverage: ₹{request.coverage?.toLocaleString()}</p>
                            <p className="text-white/80">Premium: ₹{request.premium?.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Application Info</h4>
                            <p className="text-white/80">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</p>
                            {request.processedAt && (
                              <p className="text-white/80">Processed: {new Date(request.processedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        
                        {request.adminNotes && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Admin Notes</h4>
                            <p className="text-white/80">{request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InsurancePage
