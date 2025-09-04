import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Lock, Unlock, FileText, Eye, Download, Trash2, Key } from 'lucide-react'
import axios from 'axios'

const StoragePage = () => {
  const navigate = useNavigate()
  
  // State management
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Upload state
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPassword, setUploadPassword] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  
  // View/decrypt state
  const [viewingDoc, setViewingDoc] = useState(null)
  const [decryptPassword, setDecryptPassword] = useState('')
  const [decryptedContent, setDecryptedContent] = useState(null)

  // Load documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  // Load all stored documents
  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/api/storage/documents')
      if (response.data.success) {
        setDocuments(response.data.documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload with encryption
  const handleUpload = async () => {
    if (!uploadFile || !uploadPassword) {
      setError('Please select a file and enter a password')
      return
    }

    if (uploadPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    const documentName = uploadName.trim() || uploadFile.name

    try {
      setLoading(true)
      setError('')
      
      const formData = new FormData()
      formData.append('document', uploadFile)
      formData.append('password', uploadPassword)
      formData.append('description', uploadDescription)
      formData.append('filename', documentName)
      formData.append('originalFilename', uploadFile.name)

      const response = await axios.post('http://localhost:5000/api/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setSuccess('Document uploaded and encrypted successfully!')
        setUploadFile(null)
        setUploadPassword('')
        setUploadName('')
        setUploadDescription('')
        await loadDocuments()
      } else {
        setError(response.data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  // Decrypt and view document
  const handleDecrypt = async (docId) => {
    if (!decryptPassword) {
      setError('Please enter the decryption password')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await axios.post('http://localhost:5000/api/storage/decrypt', {
        documentId: docId,
        password: decryptPassword
      })

      if (response.data.success) {
        setDecryptedContent(response.data.content)
        setSuccess('Document decrypted successfully!')
      } else {
        setError(response.data.error || 'Decryption failed')
      }
    } catch (error) {
      console.error('Decryption error:', error)
      setError('Failed to decrypt document')
    } finally {
      setLoading(false)
    }
  }

  // Download decrypted document
  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Delete document
  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete(`http://localhost:5000/api/storage/documents/${docId}`)
      
      if (response.data.success) {
        setSuccess('Document deleted successfully!')
        await loadDocuments()
      } else {
        setError(response.data.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete document')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-4xl font-bold mb-4">Secure Document Storage</h1>
        <p className="text-lg opacity-90">Encrypted document storage with password protection</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-center">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-blue-400" size={32} />
            <h2 className="text-2xl font-bold">Upload Document</h2>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block mb-2 font-medium">Select Document</label>
              <div className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                uploadFile 
                  ? 'border-green-400/50 bg-green-400/10' 
                  : 'border-white/30 hover:border-white/50'
              }`}>
                <FileText className={`mx-auto mb-2 ${
                  uploadFile ? 'text-green-400' : 'text-white/60'
                }`} size={32} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setUploadFile(file)
                      if (!uploadName) {
                        setUploadName(file.name)
                      }
                      setError('')
                    }
                  }}
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer block text-center">
                  {uploadFile ? (
                    <div>
                      <div className="text-green-400 font-medium mb-1">✓ Selected</div>
                      <div className="text-sm text-green-300">{uploadFile.name}</div>
                      <div className="text-xs text-white/60 mt-1">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white/60 mb-1">Click to select document</div>
                      <div className="text-xs text-white/40">PDF, DOC, TXT, Images supported</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Custom Document Name */}
            <div>
              <label className="block mb-2 font-medium">Document Name *</label>
              <input
                type="text"
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom name for the document"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
              <p className="text-xs text-white/60 mt-1">
                This will be the display name for your document
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 font-medium">Description (Optional)</label>
              <textarea
                className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description of the document (e.g., 'Passport copy for loan application', 'Medical certificate for insurance claim')"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
              <p className="text-xs text-white/60 mt-1">
                Add context about what this document is for
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium">Encryption Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter strong password (min 6 chars)"
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !uploadFile || !uploadPassword || !uploadName.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Encrypting & Uploading...' : 'Upload & Encrypt'}
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-green-400" size={32} />
            <h2 className="text-2xl font-bold">Stored Documents</h2>
          </div>

          {loading && documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/60">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 text-white/40" size={48} />
              <p className="text-white/60">No documents stored yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white truncate">{doc.filename}</h3>
                    <span className="text-xs text-white/60">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-white/80 mb-3">{doc.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      {(doc.size / 1024).toFixed(1)} KB • Encrypted
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setViewingDoc(doc)
                          setDecryptPassword('')
                          setDecryptedContent(null)
                          setError('')
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                        title="View/Decrypt"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Decrypt Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Decrypt Document</h2>
              <button
                onClick={() => {
                  setViewingDoc(null)
                  setDecryptedContent(null)
                  setDecryptPassword('')
                }}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">{viewingDoc.filename}</h3>
              <div className="text-white/80 space-y-1 text-sm">
                <p><strong>Size:</strong> {(viewingDoc.size / 1024).toFixed(1)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(viewingDoc.uploadedAt).toLocaleDateString()}</p>
                {viewingDoc.description && <p><strong>Description:</strong> {viewingDoc.description}</p>}
              </div>
            </div>

            {!decryptedContent ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-white">Enter Decryption Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password to decrypt"
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDecrypt(viewingDoc._id)}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => handleDecrypt(viewingDoc._id)}
                  disabled={loading || !decryptPassword}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Decrypting...' : 'Decrypt & View'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Unlock className="text-green-400" size={20} />
                    <span className="text-green-400 font-medium">Document Decrypted Successfully!</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDownload(decryptedContent, viewingDoc.filename)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StoragePage
