import { useState } from 'react'
import { Plane, Car, Heart, FileText } from 'lucide-react'
import axios from 'axios'

function InsuranceApplication({ walletAddress, onApplicationSubmit, loading, setLoading, error, setError }) {
  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = storedUser._id;

  // Insurance application state
  const [insuranceData, setInsuranceData] = useState({
    type: '',
    coverage: '',
    premium: '',
    duration: '12',
    beneficiary: '',
    details: ''
  })
  
  // Document upload state
  const [documents, setDocuments] = useState({
    proof: null,
    identity: null
  })

  // Insurance types configuration
  const insuranceTypes = {
    flight: {
      name: 'Flight Insurance',
      icon: Plane,
      description: 'Coverage for flight delays, cancellations, and baggage loss',
      proofLabel: 'Flight Ticket',
      proofDescription: 'Upload your flight ticket or booking confirmation',
      coverageOptions: [
        { value: '10000', label: '₹10,000 - Basic Coverage' },
        { value: '25000', label: '₹25,000 - Standard Coverage' },
        { value: '50000', label: '₹50,000 - Premium Coverage' }
      ]
    },
    car: {
      name: 'Car Insurance',
      icon: Car,
      description: 'Comprehensive coverage for your vehicle',
      proofLabel: 'Vehicle Documents',
      proofDescription: 'Upload RC, driving license, or vehicle registration',
      coverageOptions: [
        { value: '100000', label: '₹1,00,000 - Third Party' },
        { value: '300000', label: '₹3,00,000 - Comprehensive' },
        { value: '500000', label: '₹5,00,000 - Premium' }
      ]
    },
    health: {
      name: 'Health Insurance',
      icon: Heart,
      description: 'Medical coverage for health emergencies',
      proofLabel: 'Medical Documents',
      proofDescription: 'Upload medical certificate, hospital ID, or health checkup report',
      coverageOptions: [
        { value: '200000', label: '₹2,00,000 - Basic Health' },
        { value: '500000', label: '₹5,00,000 - Family Coverage' },
        { value: '1000000', label: '₹10,00,000 - Premium Health' }
      ]
    }
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setInsuranceData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-calculate premium based on coverage
    if (field === 'coverage') {
      const coverage = parseInt(value)
      const premium = Math.round(coverage * 0.02) // 2% of coverage as premium
      setInsuranceData(prev => ({
        ...prev,
        premium: premium.toString()
      }))
    }
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

  // Submit insurance application
  const submitInsuranceApplication = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    console.log('User data from localStorage:', storedUser)
    console.log('User ID:', userId)

    if (!userId) {
      setError('Please log in to submit an insurance application. User ID not found.')
      return
    }

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      setError('Invalid user session. Please log in again.')
      return
    }

    if (!insuranceData.type || !insuranceData.coverage || !documents.proof) {
      setError('Please fill in all required fields and upload proof documents')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      
      // Add insurance data
      Object.keys(insuranceData).forEach(key => {
        formData.append(key, insuranceData[key])
      })
      
      // Add wallet address and userId
      formData.append('walletAddress', walletAddress)
      formData.append('userId', userId)
      
      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key])
        }
      })

      const response = await axios.post('http://localhost:5000/api/insurance/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // Reset form
        setInsuranceData({
          type: '',
          coverage: '',
          premium: '',
          duration: '12',
          beneficiary: '',
          details: ''
        })
        setDocuments({ proof: null, identity: null })
        
        // Notify parent component with the request data
        onApplicationSubmit({
          requestId: response.data.requestId,
          status: response.data.status,
          message: response.data.message
        })
      } else {
        setError(response.data.error || 'Failed to submit insurance application')
      }
    } catch (error) {
      console.error('Insurance application error:', error)
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
      } else {
        setError('Failed to submit insurance application. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedType = insuranceTypes[insuranceData.type]
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Insurance Application</h2>
        
        {/* Insurance Type Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Select Insurance Type</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(insuranceTypes).map(([key, type]) => {
              const Icon = type.icon
              return (
                <button
                  key={key}
                  onClick={() => handleInputChange('type', key)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    insuranceData.type === key
                      ? 'border-blue-400 bg-blue-400/20'
                      : 'border-white/30 bg-white/5 hover:border-white/50'
                  }`}
                >
                  <Icon className={`mx-auto mb-3 ${
                    insuranceData.type === key ? 'text-blue-400' : 'text-white/60'
                  }`} size={32} />
                  <h4 className="font-semibold text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-white/70">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {selectedType && (
          <>
            {/* Coverage and Premium */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Coverage Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-white">Coverage Amount *</label>
                  <select
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={insuranceData.coverage}
                    onChange={(e) => handleInputChange('coverage', e.target.value)}
                  >
                    <option value="" className="bg-gray-800">Select coverage amount</option>
                    {selectedType.coverageOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-white">Premium Amount</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={insuranceData.premium ? `₹${insuranceData.premium}` : ''}
                    readOnly
                    placeholder="Auto-calculated based on coverage"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-white">Policy Duration</label>
                  <select
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={insuranceData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  >
                    <option value="6" className="bg-gray-800">6 months</option>
                    <option value="12" className="bg-gray-800">12 months</option>
                    <option value="24" className="bg-gray-800">24 months</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-white">Beneficiary Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter beneficiary name"
                    value={insuranceData.beneficiary}
                    onChange={(e) => handleInputChange('beneficiary', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Document Upload</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Proof Document */}
                <div className="text-center">
                  <label className="block mb-2 font-medium text-white">{selectedType.proofLabel} *</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    documents.proof 
                      ? 'border-green-400/50 bg-green-400/10' 
                      : 'border-white/30 hover:border-white/50'
                  }`}>
                    <FileText className={`mx-auto mb-2 ${
                      documents.proof ? 'text-green-400' : 'text-white/60'
                    }`} size={32} />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          handleDocumentUpload('proof', file)
                        }
                      }}
                      id="upload-proof"
                    />
                    <label htmlFor="upload-proof" className="cursor-pointer block">
                      {documents.proof ? (
                        <div>
                          <div className="text-green-400 font-medium mb-1">✓ Uploaded</div>
                          <div className="text-sm text-green-300">{documents.proof.name}</div>
                          <div className="text-xs text-white/60 mt-1">
                            {(documents.proof.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-white/60 mb-1">{selectedType.proofDescription}</div>
                          <div className="text-xs text-white/40">PDF, JPG, PNG (Max 5MB)</div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Identity Document */}
                <div className="text-center">
                  <label className="block mb-2 font-medium text-white">Identity Proof</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    documents.identity 
                      ? 'border-green-400/50 bg-green-400/10' 
                      : 'border-white/30 hover:border-white/50'
                  }`}>
                    <FileText className={`mx-auto mb-2 ${
                      documents.identity ? 'text-green-400' : 'text-white/60'
                    }`} size={32} />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          handleDocumentUpload('identity', file)
                        }
                      }}
                      id="upload-identity"
                    />
                    <label htmlFor="upload-identity" className="cursor-pointer block">
                      {documents.identity ? (
                        <div>
                          <div className="text-green-400 font-medium mb-1">✓ Uploaded</div>
                          <div className="text-sm text-green-300">{documents.identity.name}</div>
                          <div className="text-xs text-white/60 mt-1">
                            {(documents.identity.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-white/60 mb-1">Upload Aadhaar, PAN, or Passport</div>
                          <div className="text-xs text-white/40">PDF, JPG, PNG (Max 5MB)</div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-8">
              <label className="block mb-2 font-medium text-white">Additional Details</label>
              <textarea
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional information about your insurance requirement"
                value={insuranceData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={submitInsuranceApplication}
                disabled={loading || !walletAddress}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Apply for Insurance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default InsuranceApplication
