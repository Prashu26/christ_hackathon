import { useState } from 'react'
import { Shield, Plane, Car, Heart, FileText } from 'lucide-react'
import axios from 'axios'

function InsuranceClaim({ walletAddress, policies, claims, setClaims, loadUserData, loading, setLoading, error, setError }) {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [claimForm, setClaimForm] = useState({
    description: '',
    amount: '',
    proof: null
  })

  // Insurance types configuration
  const insuranceTypes = {
    flight: {
      name: 'Flight Insurance',
      icon: Plane,
      description: 'Coverage for flight delays, cancellations, and baggage loss'
    },
    car: {
      name: 'Car Insurance',
      icon: Car,
      description: 'Comprehensive coverage for your vehicle'
    },
    health: {
      name: 'Health Insurance',
      icon: Heart,
      description: 'Medical coverage for health emergencies'
    }
  }

  // Submit claim with proof upload
  const submitClaim = async (policyId, claimData) => {
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('policyId', policyId)
      formData.append('walletAddress', walletAddress)
      formData.append('description', claimData.description)
      formData.append('amount', claimData.amount)
      
      if (claimData.proof) {
        formData.append('claimProof', claimData.proof)
      }

      console.log('Submitting claim with proof:', {
        policyId,
        description: claimData.description,
        amount: claimData.amount,
        hasProof: !!claimData.proof
      })

      const response = await axios.post('http://localhost:5000/api/insurance/claim', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setClaims(prev => [...prev, response.data.claim])
        await loadUserData(walletAddress) // Refresh data
        setError('') // Clear any errors
      } else {
        setError(response.data.error || 'Failed to submit claim')
      }
    } catch (error) {
      console.error('Claim submission error:', error)
      setError('Failed to submit claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render policies dashboard
  const renderPoliciesDashboard = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">My Insurance Policies</h2>
        
        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto mb-4 text-white/40" size={64} />
            <p className="text-white/60 text-lg">No insurance policies found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {policies.map((policy, index) => {
              const typeConfig = insuranceTypes[policy.type]
              const Icon = typeConfig?.icon || Shield
              
              return (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="text-blue-400" size={24} />
                      <h3 className="text-xl font-semibold text-white">
                        {typeConfig?.name || policy.type}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      policy.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      policy.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-white/80 mb-4">
                    <p><strong>Coverage:</strong> ₹{parseInt(policy.coverage).toLocaleString()}</p>
                    <p><strong>Premium:</strong> ₹{parseInt(policy.premium).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {policy.duration} months</p>
                    <p><strong>Applied:</strong> {new Date(policy.appliedAt).toLocaleDateString()}</p>
                    {policy.beneficiary && <p><strong>Beneficiary:</strong> {policy.beneficiary}</p>}
                  </div>

                  {policy.status === 'active' && (
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy)
                        setClaimForm({
                          description: '',
                          amount: '',
                          proof: null
                        })
                        setShowClaimModal(true)
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Submit Claim
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // Render claim submission modal
  const renderClaimModal = () => {
    if (!showClaimModal || !selectedPolicy) return null

    const typeConfig = insuranceTypes[selectedPolicy.type]
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Submit Insurance Claim</h2>
            <button
              onClick={() => setShowClaimModal(false)}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Policy Details</h3>
            <div className="text-white/80 space-y-1">
              <p><strong>Type:</strong> {typeConfig?.name || selectedPolicy.type}</p>
              <p><strong>Coverage:</strong> ₹{parseInt(selectedPolicy.coverage).toLocaleString()}</p>
              <p><strong>Policy ID:</strong> {selectedPolicy.id}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Claim Description */}
            <div>
              <label className="block mb-2 font-medium text-white">Claim Description *</label>
              <textarea
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe the incident and reason for claim"
                value={claimForm.description}
                onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Claim Amount */}
            <div>
              <label className="block mb-2 font-medium text-white">Claim Amount (₹) *</label>
              <input
                type="number"
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter claim amount"
                max={selectedPolicy.coverage}
                value={claimForm.amount}
                onChange={(e) => setClaimForm(prev => ({ ...prev, amount: e.target.value }))}
              />
              <p className="text-sm text-white/60 mt-1">
                Maximum claimable: ₹{parseInt(selectedPolicy.coverage).toLocaleString()}
              </p>
            </div>

            {/* Proof Upload */}
            <div>
              <label className="block mb-2 font-medium text-white">Upload Proof Document *</label>
              <div className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                claimForm.proof 
                  ? 'border-green-400/50 bg-green-400/10' 
                  : 'border-white/30 hover:border-white/50'
              }`}>
                <FileText className={`mx-auto mb-2 ${
                  claimForm.proof ? 'text-green-400' : 'text-white/60'
                }`} size={32} />
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      // Validate file
                      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
                      if (!allowedTypes.includes(file.type)) {
                        setError('Invalid file type. Please upload PDF, JPG, or PNG files only.')
                        return
                      }
                      const maxSize = 5 * 1024 * 1024 // 5MB
                      if (file.size > maxSize) {
                        setError('File too large. Please upload files smaller than 5MB.')
                        return
                      }
                      setClaimForm(prev => ({ ...prev, proof: file }))
                      setError('')
                    }
                  }}
                  id="claim-proof-upload"
                />
                <label htmlFor="claim-proof-upload" className="cursor-pointer block text-center">
                  {claimForm.proof ? (
                    <div>
                      <div className="text-green-400 font-medium mb-1">✓ Uploaded</div>
                      <div className="text-sm text-green-300">{claimForm.proof.name}</div>
                      <div className="text-xs text-white/60 mt-1">
                        {(claimForm.proof.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white/60 mb-1">Click to upload proof</div>
                      <div className="text-xs text-white/40">
                        Upload bills, receipts, reports, or incident photos
                      </div>
                      <div className="text-xs text-white/40">PDF, JPG, PNG (Max 5MB)</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowClaimModal(false)}
                className="flex-1 px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!claimForm.description || !claimForm.amount || !claimForm.proof) {
                    setError('Please fill in all required fields and upload proof document')
                    return
                  }
                  
                  const claimAmount = parseFloat(claimForm.amount)
                  if (claimAmount > selectedPolicy.coverage) {
                    setError('Claim amount cannot exceed policy coverage')
                    return
                  }

                  await submitClaim(selectedPolicy.id, claimForm)
                  setShowClaimModal(false)
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render claims dashboard
  const renderClaimsDashboard = () => (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">My Claims</h2>
        
        {claims.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/60">No claims submitted yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {claims.map((claim, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Claim #{claim.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    claim.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 text-white/80">
                  <p><strong>Policy ID:</strong> {claim.policyId}</p>
                  <p><strong>Amount:</strong> ₹{parseInt(claim.amount).toLocaleString()}</p>
                  <p><strong>Description:</strong> {claim.description}</p>
                  <p><strong>Submitted:</strong> {new Date(claim.submittedAt).toLocaleDateString()}</p>
                  {claim.status === 'approved' && claim.paidAt && (
                    <p><strong>Paid:</strong> {new Date(claim.paidAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {renderPoliciesDashboard()}
      {renderClaimsDashboard()}
      {renderClaimModal()}
    </div>
  )
}

export default InsuranceClaim
