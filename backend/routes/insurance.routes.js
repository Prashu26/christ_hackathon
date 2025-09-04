const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user.model');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/insurance';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

// In-memory storage for demo purposes (use database in production)
let policies = [];
let claims = [];
let policyIdCounter = 1;
let claimIdCounter = 1;

// Generate unique policy ID
const generatePolicyId = () => {
  return `POL-${Date.now()}-${policyIdCounter++}`;
};

// Generate unique claim ID
const generateClaimId = () => {
  return `CLM-${Date.now()}-${claimIdCounter++}`;
};

// Apply for insurance
router.post('/apply', upload.fields([
  { name: 'proof', maxCount: 1 },
  { name: 'identity', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      type,
      coverage,
      premium,
      duration,
      beneficiary,
      details,
      walletAddress,
      userId,
      age,
      occupation,
      healthConditions
    } = req.body;

    // Validate required fields
    if (!type || !coverage || !premium || !walletAddress || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, coverage, premium, walletAddress, userId'
      });
    }

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user already has a pending insurance request of the same type
    const existingRequest = user.insuranceRequests.find(req => 
      req.insuranceType === type && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: `You already have a pending ${type} insurance application`
      });
    }

    // Process uploaded files
    const documents = [];
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        if (req.files[key] && req.files[key][0]) {
          documents.push(req.files[key][0].filename);
        }
      });
    }

    // Generate unique request ID
    const requestId = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create insurance request for admin approval
    const insuranceRequest = {
      requestId,
      insuranceType: type,
      coverage: parseFloat(coverage),
      premium: parseFloat(premium),
      personalInfo: {
        age: age ? parseInt(age) : undefined,
        occupation: occupation || '',
        healthConditions: healthConditions || ''
      },
      documents,
      status: 'pending',
      submittedAt: new Date()
    };

    // Add insurance request to user
    user.insuranceRequests.push(insuranceRequest);
    await user.save();

    console.log(`Insurance application submitted for admin approval: ${type} by ${walletAddress}`);
    console.log(`Request ID: ${requestId}, Coverage: ₹${coverage}, Premium: ₹${premium}`);

    res.json({
      success: true,
      message: 'Insurance application submitted successfully. It will be reviewed by our admin team.',
      requestId: requestId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error processing insurance application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process insurance application'
    });
  }
});

// Get insurance status by user ID
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's insurance requests
    const insuranceRequests = user.insuranceRequests || [];
    
    res.json({
      success: true,
      insuranceRequests: insuranceRequests.map(req => ({
        requestId: req.requestId,
        insuranceType: req.insuranceType,
        coverage: req.coverage,
        premium: req.premium,
        personalInfo: req.personalInfo,
        status: req.status,
        submittedAt: req.submittedAt,
        processedAt: req.processedAt,
        adminNotes: req.adminNotes
      }))
    });

  } catch (error) {
    console.error('Error fetching insurance status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insurance status'
    });
  }
});

// Submit insurance claim with proof validation and auto-approval
router.post('/claim', upload.single('claimProof'), (req, res) => {
  try {
    const { policyId, walletAddress, description, amount } = req.body
    const proofFile = req.file

    console.log('Claim submission:', { policyId, walletAddress, description, amount, hasProof: !!proofFile })

    // Validate required fields
    if (!policyId || !walletAddress || !description || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    // Validate proof document is required
    if (!proofFile) {
      return res.status(400).json({
        success: false,
        error: 'Proof document is required for claim submission'
      })
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(proofFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed'
      })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (proofFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      })
    }

    // Find the policy
    const policy = policies.find(p => p.id === policyId && p.walletAddress === walletAddress)
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      })
    }

    // Validate policy is active
    if (policy.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Policy is not active'
      })
    }

    // Validate claim amount
    const claimAmount = parseFloat(amount)
    if (claimAmount <= 0 || claimAmount > policy.coverage) {
      return res.status(400).json({
        success: false,
        error: `Invalid claim amount. Must be between ₹1 and ₹${policy.coverage.toLocaleString()}`
      })
    }

    // Check for duplicate claims (prevent multiple claims for same incident)
    const existingClaim = claims.find(c => 
      c.policyId === policyId && 
      c.description.toLowerCase() === description.toLowerCase() &&
      c.status !== 'rejected'
    )
    
    if (existingClaim) {
      return res.status(400).json({
        success: false,
        error: 'A similar claim already exists for this policy'
      })
    }

    // Auto-approve claim with proof validation (simplified for hackathon)
    const currentTime = new Date().toISOString()
    const claim = {
      id: generateClaimId(),
      policyId,
      walletAddress,
      description,
      amount: claimAmount,
      status: 'approved', // Auto-approve since proof is provided
      submittedAt: currentTime,
      approvedAt: currentTime,
      paidAt: currentTime,
      proofDocument: {
        filename: proofFile.filename,
        originalName: proofFile.originalname,
        size: proofFile.size,
        mimetype: proofFile.mimetype,
        uploadedAt: currentTime
      },
      autoApproved: true,
      approvalReason: 'Auto-approved with valid proof document'
    }

    claims.push(claim)

    console.log('Claim auto-approved:', {
      claimId: claim.id,
      amount: claimAmount,
      proofProvided: true,
      autoApproved: true
    })

    res.json({
      success: true,
      claim,
      message: `Claim approved and payment of ₹${claimAmount.toLocaleString()} processed successfully!`
    })

  } catch (error) {
    console.error('Claim submission error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
});

// Get claims by wallet address
router.get('/claims/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const userClaims = claims.filter(claim => 
      claim.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );

    res.json({
      success: true,
      claims: userClaims
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claims'
    });
  }
});

// Get all policies (admin endpoint - for demo purposes)
router.get('/admin/policies', (req, res) => {
  try {
    const safePolicies = policies.map(policy => ({
      ...policy,
      documents: Object.keys(policy.documents || {})
    }));

    res.json({
      success: true,
      policies: safePolicies,
      total: policies.length
    });

  } catch (error) {
    console.error('Error fetching all policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch policies'
    });
  }
});

// Get all claims (admin endpoint - for demo purposes)
router.get('/admin/claims', (req, res) => {
  try {
    res.json({
      success: true,
      claims: claims,
      total: claims.length
    });

  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claims'
    });
  }
});

// Get insurance statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalClaims: claims.length,
      approvedClaims: claims.filter(c => c.status === 'approved').length,
      totalCoverage: policies.reduce((sum, p) => sum + p.coverage, 0),
      totalPremiums: policies.reduce((sum, p) => sum + p.premium, 0),
      totalClaimAmount: claims.reduce((sum, c) => sum + c.amount, 0),
      policyTypes: {
        flight: policies.filter(p => p.type === 'flight').length,
        car: policies.filter(p => p.type === 'car').length,
        health: policies.filter(p => p.type === 'health').length
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching insurance statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insurance statistics'
    });
  }
});

module.exports = router;
