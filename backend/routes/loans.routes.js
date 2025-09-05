const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user.model');
const router = express.Router();

// Test endpoint to verify backend is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Loan routes are working',
    timestamp: new Date().toISOString()
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/loans';
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
let loans = [];
let loanIdCounter = 1;

// Generate unique loan ID
const generateLoanId = () => {
  return `LOAN-${Date.now()}-${loanIdCounter++}`;
};

// Apply for loan
router.post('/apply', upload.fields([
  { name: 'identity', maxCount: 1 },
  { name: 'income', maxCount: 1 },
  { name: 'address', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      loanAmount,
      purpose,
      repaymentPeriod,
      monthlyIncome,
      employmentType,
      walletAddress,
      userId
    } = req.body;

    console.log('Received loan application data:', {
      name, email, loanAmount, walletAddress, userId,
      monthlyIncome, employmentType, purpose
    });

    // Validate required fields
    if (!name || !email || !loanAmount || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, loanAmount, userId'
      });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(loanAmount)) || parseFloat(loanAmount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan amount. Must be a positive number.'
      });
    }

    if (monthlyIncome && (isNaN(parseFloat(monthlyIncome)) || parseFloat(monthlyIncome) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid monthly income. Must be a positive number.'
      });
    }

    // Validate userId format (MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    // Find user in database
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    console.log('User found:', user.name);

    // Check if user already has a pending loan request (optional check - can be removed if multiple applications are allowed)
    const existingRequest = user.loanRequests.find(req => 
      req.status === 'pending'
    );

    if (existingRequest) {
      console.log('User has existing pending request:', existingRequest.requestId);
      // Comment out the restriction to allow multiple applications for testing
      // return res.status(400).json({
      //   success: false,
      //   error: 'You already have a pending loan application'
      // });
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
    const requestId = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create loan request for admin approval
    const loanRequest = {
      requestId,
      loanType: purpose || 'Personal Loan',
      amount: parseFloat(loanAmount),
      purpose: purpose || 'Personal Loan',
      income: parseFloat(monthlyIncome) || 0,
      employmentType: employmentType || 'Not specified',
      repaymentPeriod: parseInt(repaymentPeriod) || 12,
      walletAddress: walletAddress || '',
      documents,
      status: 'pending',
      submittedAt: new Date()
    };

    console.log('Creating loan request:', loanRequest);

    // Add loan request to user
    console.log('Adding loan request to user...');
    user.loanRequests.push(loanRequest);
    
    console.log('Saving user with loan request...');
    await user.save();
    console.log('User saved successfully');

    console.log(`Loan application submitted for admin approval: ${name} (${walletAddress || 'No wallet'})`);
    console.log(`Request ID: ${requestId}, Amount: ${loanAmount} ETH`);

    res.json({
      success: true,
      message: 'Loan application submitted successfully. It will be reviewed by our admin team.',
      requestId: requestId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error processing loan application:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process loan application',
      details: error.message
    });
  }
});

// Get loan status by user ID
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

    // Get user's loan requests
    const loanRequests = user.loanRequests || [];
    
    res.json({
      success: true,
      loanRequests: loanRequests.map(req => ({
        requestId: req.requestId,
        loanType: req.loanType,
        amount: req.amount,
        purpose: req.purpose,
        repaymentPeriod: req.repaymentPeriod,
        walletAddress: req.walletAddress,
        status: req.status,
        submittedAt: req.submittedAt,
        processedAt: req.processedAt,
        adminNotes: req.adminNotes
      }))
    });

  } catch (error) {
    console.error('Error fetching loan status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan status'
    });
  }
});

// Repay loan
router.post('/repay', (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, amount'
      });
    }

    const loanIndex = loans.findIndex(loan => 
      loan.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      loan.status === 'approved' &&
      !loan.repaid
    );

    if (loanIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'No active loan found for repayment'
      });
    }

    // Update loan status
    loans[loanIndex].repaid = true;
    loans[loanIndex].repaidAt = new Date().toISOString();
    loans[loanIndex].repaidAmount = parseFloat(amount);
    loans[loanIndex].status = 'repaid';

    console.log(`Loan repaid: ${loans[loanIndex].id} by ${walletAddress}`);

    res.json({
      success: true,
      message: 'Loan repaid successfully',
      loan: loans[loanIndex]
    });

  } catch (error) {
    console.error('Error processing loan repayment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process loan repayment'
    });
  }
});

// Get all loans (admin endpoint - for demo purposes)
router.get('/all', (req, res) => {
  try {
    const safeLoans = loans.map(loan => ({
      ...loan,
      documents: Object.keys(loan.documents || {})
    }));

    res.json({
      success: true,
      loans: safeLoans,
      total: loans.length
    });

  } catch (error) {
    console.error('Error fetching all loans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loans'
    });
  }
});

// Get loan statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalLoans: loans.length,
      approvedLoans: loans.filter(loan => loan.status === 'approved').length,
      repaidLoans: loans.filter(loan => loan.repaid).length,
      pendingLoans: loans.filter(loan => loan.status === 'pending').length,
      rejectedLoans: loans.filter(loan => loan.status === 'rejected').length,
      totalAmount: loans.reduce((sum, loan) => sum + loan.loanAmount, 0),
      totalRepaid: loans.filter(loan => loan.repaid).reduce((sum, loan) => sum + (loan.repaidAmount || 0), 0)
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching loan statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan statistics'
    });
  }
});

module.exports = router;
