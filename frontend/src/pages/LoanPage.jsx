import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, Percent, FileText, AlertCircle, CheckCircle, Clock, X, Link } from 'lucide-react';
import axios from 'axios';
import Web3Integration from '../components/Web3Integration';
import { loanContract, web3Utils } from '../utils/web3';

function LoanPage() {
  const navigate = useNavigate()
  
  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = storedUser._id;
  
  // State management
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [web3Account, setWeb3Account] = useState('')
  const [web3Balance, setWeb3Balance] = useState('0')
  const [currentStep, setCurrentStep] = useState('application') // application, status, repayment
  
  // Loan application state
  const [loanData, setLoanData] = useState({
    name: '',
    email: '',
    phone: '',
    loanAmount: '',
    purpose: '',
    repaymentPeriod: '12',
    monthlyIncome: '',
    employmentType: ''
  })
  
  // Document upload state
  const [documents, setDocuments] = useState({
    identity: null,
    income: null,
    address: null
  })
  
  // Loan status state
  const [loanStatus, setLoanStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Check loan status on component mount if user is logged in
  useEffect(() => {
    if (userId) {
      loadLoanStatus();
    }
  }, [userId]);

  const loadLoanStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/loans/status/${userId}`);
      
      if (response.data.success) {
        setLoanStatus(response.data.loanRequests || []);
      }
    } catch (error) {
      console.error('Error loading loan status:', error);
      setError('Failed to load loan status');
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

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setLoanData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle document upload
  const handleDocumentUpload = (type, file) => {
    console.log(`Uploading document - Type: ${type}, File:`, file)
    
    if (!file) {
      console.error('No file selected')
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type for ${type}. Please upload PDF, JPG, or PNG files only.`)
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError(`File too large for ${type}. Please upload files smaller than 5MB.`)
      return
    }

    setDocuments(prev => ({
      ...prev,
      [type]: file
    }))
    
    console.log(`Document uploaded successfully - ${type}:`, file.name)
    setError('') // Clear any previous errors
  }

  // Submit loan application with smart contract integration
  const submitLoanApplication = async () => {
    // Validate required fields
    if (!loanData.name || !loanData.email || !loanData.phone || !loanData.loanAmount || 
        !loanData.purpose || !loanData.monthlyIncome || !loanData.employmentType) {
      setError('Please fill in all required fields')
      return
    }

    // Validate documents
    if (!documents.identity || !documents.income || !documents.address) {
      setError('Please upload all required documents')
      return
    }

    // Validate user authentication
    if (!userId) {
      setError('Please log in to submit loan application')
      return
    }

    // Validate Web3 connection for smart contract interaction
    if (!walletConnected || !web3Account) {
      setError('Please connect your wallet to proceed with blockchain loan')
      return
    }

    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      
      // Add loan data
      formData.append('userId', userId)
      formData.append('name', loanData.name)
      formData.append('email', loanData.email)
      formData.append('phone', loanData.phone)
      formData.append('loanAmount', loanData.loanAmount)
      formData.append('purpose', loanData.purpose)
      formData.append('repaymentPeriod', loanData.repaymentPeriod)
      formData.append('monthlyIncome', loanData.monthlyIncome)
      formData.append('employmentType', loanData.employmentType)
      formData.append('walletAddress', web3Account)
      
      // Add documents
      formData.append('identityProof', documents.identity)
      formData.append('incomeProof', documents.income)
      formData.append('addressProof', documents.address)

      console.log('Submitting loan application with userId:', userId)

      // Submit to backend first
      const response = await axios.post('http://localhost:5000/api/loans/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Loan application response:', response.data)

      if (response.data.success) {
        // Create smart contract loan request
        const requestId = response.data.requestId || `loan-${Date.now()}`;
        const interestRate = 500; // 5% default interest rate
        
        const contractResult = await loanContract.requestLoan(
          loanData.loanAmount,
          interestRate,
          parseInt(loanData.repaymentPeriod),
          requestId
        );

        if (contractResult.success) {
          console.log('Smart contract loan request created:', contractResult.txHash);
          
          // Reset form
          setLoanData({
            name: '',
            email: '',
            phone: '',
            loanAmount: '',
            purpose: '',
            repaymentPeriod: '12',
            monthlyIncome: '',
            employmentType: ''
          })
          setDocuments({
            identity: null,
            income: null,
            address: null
          })
          
          // Refresh loan status
          await loadLoanStatus()
          
          // Switch to status view
          setCurrentStep('status')
          setError('')
        } else {
          setError(`Smart contract error: ${contractResult.error}`)
        }
      } else {
        setError(response.data.message || 'Failed to submit loan application')
      }
    } catch (error) {
      console.error('Loan application error:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Failed to submit loan application. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Activate loan with collateral (for approved loans)
  const activateLoan = async (loanRequest) => {
    if (!walletConnected || !web3Account) {
      setError('Please connect your wallet to activate loan')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Calculate required collateral (150% of loan amount)
      const collateralAmount = parseFloat(loanRequest.amount) * 1.5;
      
      // Get loan from smart contract
      const contractLoan = await loanContract.getLoanByRequestId(loanRequest.requestId);
      
      if (contractLoan) {
        const result = await loanContract.activateLoan(contractLoan.loanId, collateralAmount);
        
        if (result.success) {
          console.log('Loan activated:', result.txHash);
          await loadLoanStatus(); // Refresh status
          setError('');
        } else {
          setError(`Activation failed: ${result.error}`);
        }
      } else {
        setError('Smart contract loan not found');
      }
    } catch (error) {
      console.error('Loan activation error:', error);
      setError('Failed to activate loan');
    } finally {
      setLoading(false);
    }
  };

  // Repay loan
  const repayLoan = async (loanRequest) => {
    if (!walletConnected || !web3Account) {
      setError('Please connect your wallet to repay loan')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Get loan from smart contract
      const contractLoan = await loanContract.getLoanByRequestId(loanRequest.requestId);
      
      if (contractLoan) {
        const totalOwed = await loanContract.calculateTotalOwed(contractLoan.loanId);
        
        const result = await loanContract.repayLoan(contractLoan.loanId, totalOwed);
        
        if (result.success) {
          console.log('Loan repaid:', result.txHash);
          await loadLoanStatus(); // Refresh status
          setError('');
        } else {
          setError(`Repayment failed: ${result.error}`);
        }
      } else {
        setError('Smart contract loan not found');
      }
    } catch (error) {
      console.error('Loan repayment error:', error);
      setError('Failed to repay loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Smart Loan System</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Web3 Integration Component */}
      <div className="max-w-6xl mx-auto">
        <Web3Integration onConnectionChange={handleWeb3Connection} />
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentStep('application')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                currentStep === 'application' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Apply for Loan
            </button>
            <button
              onClick={() => setCurrentStep('status')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                currentStep === 'status' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Loan Status
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
            <div className="flex items-center justify-center space-x-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {currentStep === 'application' ? (
          /* Loan Application Form */
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Apply for Smart Loan</h2>
            
            {!userId ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg mb-6">Please log in to apply for a loan</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={loanData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Email *</label>
                      <input
                        type="email"
                        value={loanData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={loanData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Employment Type *</label>
                      <select
                        value={loanData.employmentType}
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="">Select employment type</option>
                        <option value="full-time">Full-time Employee</option>
                        <option value="part-time">Part-time Employee</option>
                        <option value="self-employed">Self-employed</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="business-owner">Business Owner</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Loan Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2">Loan Amount (ETH) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                        <input
                          type="number"
                          step="0.01"
                          value={loanData.loanAmount}
                          onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                          className="w-full p-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                          placeholder="Enter loan amount in ETH"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Repayment Period *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                        <select
                          value={loanData.repaymentPeriod}
                          onChange={(e) => handleInputChange('repaymentPeriod', e.target.value)}
                          className="w-full p-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Monthly Income (USD) *</label>
                      <input
                        type="number"
                        value={loanData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                        placeholder="Enter your monthly income"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Loan Purpose *</label>
                      <input
                        type="text"
                        value={loanData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                        placeholder="Purpose of the loan"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Required Documents</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { type: 'identity', label: 'Identity Proof', icon: FileText },
                      { type: 'income', label: 'Income Proof', icon: DollarSign },
                      { type: 'address', label: 'Address Proof', icon: FileText }
                    ].map(({ type, label, icon: Icon }) => (
                      <div key={type} className="bg-white/5 p-6 rounded-xl border border-white/20">
                        <div className="flex items-center space-x-3 mb-4">
                          <Icon className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">{label}</span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(type, e.target.files[0])}
                          className="w-full text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />
                        {documents[type] && (
                          <div className="mt-2 flex items-center space-x-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">{documents[type].name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    onClick={submitLoanApplication}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Loan Application'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Loan Status Display */
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Loan Status</h2>
            
            {!userId ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg mb-6">Please log in to view your loan status</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                >
                  Go to Login
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-white/60 text-lg">Loading loan status...</p>
              </div>
            ) : !loanStatus || loanStatus.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg mb-6">No loan applications found</p>
                <button
                  onClick={() => setCurrentStep('application')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                >
                  Apply for Loan
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {loanStatus.map((loan, index) => (
                  <div key={loan.requestId || index} className={`p-6 rounded-xl border ${
                    loan.status === 'approved' ? 'bg-green-500/20 border-green-500/50' :
                    loan.status === 'rejected' ? 'bg-red-500/20 border-red-500/50' :
                    'bg-yellow-500/20 border-yellow-500/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Loan Application #{loan.requestId}
                        </h3>
                        <p className="text-white/80">Amount: {loan.amount} ETH</p>
                        <p className="text-white/80">Status: {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        loan.status === 'approved' ? 'bg-green-500/30 text-green-300' :
                        loan.status === 'rejected' ? 'bg-red-500/30 text-red-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Loan Details</h4>
                        <p className="text-white/80">Amount: {loan.amount} ETH</p>
                        <p className="text-white/80">Interest Rate: 5%</p>
                        <p className="text-white/80">Repayment Period: {loan.repaymentPeriod} months</p>
                        <p className="text-white/80">Purpose: {loan.purpose}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Application Info</h4>
                        <p className="text-white/80">Submitted: {new Date(loan.submittedAt).toLocaleDateString()}</p>
                        {loan.processedAt && (
                          <p className="text-white/80">Processed: {new Date(loan.processedAt).toLocaleDateString()}</p>
                        )}
                        {loan.walletAddress && (
                          <p className="text-white/80">Wallet: {web3Utils.formatAddress(loan.walletAddress)}</p>
                        )}
                      </div>
                    </div>
                    
                    {loan.adminNotes && (
                      <div className="bg-white/5 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-white mb-2">Admin Notes</h4>
                        <p className="text-white/80">{loan.adminNotes}</p>
                      </div>
                    )}

                    {/* Smart Contract Actions */}
                    {loan.status === 'approved' && walletConnected && (
                      <div className="flex space-x-4 mt-4">
                        <button
                          onClick={() => activateLoan(loan)}
                          disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Activate Loan (Deposit Collateral)'}
                        </button>
                        <button
                          onClick={() => repayLoan(loan)}
                          disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Repay Loan'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanPage
