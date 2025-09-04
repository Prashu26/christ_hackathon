import { ethers } from 'ethers';

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  SMART_LOAN: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Update with actual address
  SMART_INSURANCE: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" // Update with actual address
};

// Contract ABIs (simplified for frontend use)
export const SMART_LOAN_ABI = [
  "function requestLoan(uint256 amount, uint256 interestRate, uint256 duration, string memory requestId) external",
  "function approveLoan(uint256 loanId) external",
  "function activateLoan(uint256 loanId) external payable",
  "function repayLoan(uint256 loanId) external payable",
  "function calculateTotalOwed(uint256 loanId) external view returns (uint256)",
  "function getLoan(uint256 loanId) external view returns (tuple(uint256 loanId, address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 collateralAmount, uint256 startTime, uint256 endTime, uint256 repaidAmount, uint8 status, string requestId))",
  "function getBorrowerLoans(address borrower) external view returns (uint256[])",
  "function getLoanByRequestId(string memory requestId) external view returns (tuple(uint256 loanId, address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 collateralAmount, uint256 startTime, uint256 endTime, uint256 repaidAmount, uint8 status, string requestId))",
  "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, string requestId)",
  "event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount)",
  "event LoanActivated(uint256 indexed loanId, address indexed borrower, uint256 collateral)",
  "event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount)"
];

export const SMART_INSURANCE_ABI = [
  "function requestPolicy(uint8 insuranceType, uint256 coverageAmount, uint256 duration, string memory requestId) external",
  "function approvePolicy(uint256 policyId) external payable",
  "function payPremium(uint256 policyId) external payable",
  "function submitClaim(uint256 policyId, uint256 claimAmount, string memory description, string memory proofHash) external",
  "function processClaim(uint256 claimId, bool approve, uint256 payoutAmount, string memory adminNotes) external",
  "function calculatePremium(uint8 insuranceType, uint256 coverageAmount) external view returns (uint256)",
  "function getPolicy(uint256 policyId) external view returns (tuple(uint256 policyId, address policyholder, uint8 insuranceType, uint256 coverageAmount, uint256 premiumAmount, uint256 duration, uint256 startTime, uint256 endTime, uint8 status, string requestId))",
  "function getClaim(uint256 claimId) external view returns (tuple(uint256 claimId, uint256 policyId, address claimant, uint256 claimAmount, string description, string proofHash, uint256 submittedAt, uint256 processedAt, uint8 status, string adminNotes))",
  "function getHolderPolicies(address holder) external view returns (uint256[])",
  "function getPolicyByRequestId(string memory requestId) external view returns (tuple(uint256 policyId, address policyholder, uint8 insuranceType, uint256 coverageAmount, uint256 premiumAmount, uint256 duration, uint256 startTime, uint256 endTime, uint8 status, string requestId))",
  "event PolicyRequested(uint256 indexed policyId, address indexed policyholder, uint8 insuranceType, string requestId)",
  "event PolicyActivated(uint256 indexed policyId, address indexed policyholder, uint256 premium)",
  "event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant, uint256 amount)",
  "event ClaimProcessed(uint256 indexed claimId, uint8 status, uint256 payoutAmount)"
];

// Loan status enum
export const LOAN_STATUS = {
  0: 'Pending',
  1: 'Approved', 
  2: 'Active',
  3: 'Repaid',
  4: 'Defaulted',
  5: 'Rejected'
};

// Insurance type enum
export const INSURANCE_TYPE = {
  0: 'Flight',
  1: 'Car', 
  2: 'Health'
};

// Policy status enum
export const POLICY_STATUS = {
  0: 'Pending',
  1: 'Active',
  2: 'Expired', 
  3: 'Cancelled',
  4: 'Rejected'
};

// Claim status enum
export const CLAIM_STATUS = {
  0: 'Pending',
  1: 'Approved',
  2: 'Rejected',
  3: 'Paid'
};

/**
 * Get Web3 provider and signer
 */
export const getWeb3Provider = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return { provider, signer };
  } else {
    throw new Error('MetaMask not installed');
  }
};

/**
 * Get contract instance
 */
export const getContract = async (contractAddress, abi) => {
  const { signer } = await getWeb3Provider();
  return new ethers.Contract(contractAddress, abi, signer);
};

/**
 * Smart Loan Contract Functions
 */
export const loanContract = {
  // Request a loan on blockchain
  async requestLoan(amount, interestRate, duration, requestId) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      const tx = await contract.requestLoan(amountWei, interestRate, duration, requestId);
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Loan request error:', error);
      return { success: false, error: error.message };
    }
  },

  // Activate approved loan with collateral
  async activateLoan(loanId, collateralAmount) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const collateralWei = ethers.utils.parseEther(collateralAmount.toString());
      
      const tx = await contract.activateLoan(loanId, { value: collateralWei });
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Loan activation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Repay loan
  async repayLoan(loanId, repaymentAmount) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const repaymentWei = ethers.utils.parseEther(repaymentAmount.toString());
      
      const tx = await contract.repayLoan(loanId, { value: repaymentWei });
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Loan repayment error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get loan details
  async getLoan(loanId) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const loan = await contract.getLoan(loanId);
      
      return {
        loanId: loan.loanId.toNumber(),
        borrower: loan.borrower,
        amount: ethers.utils.formatEther(loan.amount),
        interestRate: loan.interestRate.toNumber(),
        duration: loan.duration.toNumber(),
        collateralAmount: ethers.utils.formatEther(loan.collateralAmount),
        startTime: loan.startTime.toNumber(),
        endTime: loan.endTime.toNumber(),
        repaidAmount: ethers.utils.formatEther(loan.repaidAmount),
        status: LOAN_STATUS[loan.status],
        requestId: loan.requestId
      };
    } catch (error) {
      console.error('Get loan error:', error);
      return null;
    }
  },

  // Get borrower's loans
  async getBorrowerLoans(borrowerAddress) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const loanIds = await contract.getBorrowerLoans(borrowerAddress);
      
      const loans = [];
      for (const loanId of loanIds) {
        const loan = await this.getLoan(loanId.toNumber());
        if (loan) loans.push(loan);
      }
      
      return loans;
    } catch (error) {
      console.error('Get borrower loans error:', error);
      return [];
    }
  },

  // Calculate total owed
  async calculateTotalOwed(loanId) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_LOAN, SMART_LOAN_ABI);
      const totalOwed = await contract.calculateTotalOwed(loanId);
      
      return ethers.utils.formatEther(totalOwed);
    } catch (error) {
      console.error('Calculate total owed error:', error);
      return '0';
    }
  }
};

/**
 * Smart Insurance Contract Functions
 */
export const insuranceContract = {
  // Request insurance policy
  async requestPolicy(insuranceType, coverageAmount, duration, requestId) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const coverageWei = ethers.utils.parseEther(coverageAmount.toString());
      
      // Convert insurance type string to enum
      const typeMap = { 'flight': 0, 'car': 1, 'health': 2 };
      const typeEnum = typeMap[insuranceType.toLowerCase()];
      
      const tx = await contract.requestPolicy(typeEnum, coverageWei, duration, requestId);
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Policy request error:', error);
      return { success: false, error: error.message };
    }
  },

  // Pay premium to activate policy
  async payPremium(policyId, premiumAmount) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const premiumWei = ethers.utils.parseEther(premiumAmount.toString());
      
      const tx = await contract.payPremium(policyId, { value: premiumWei });
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Premium payment error:', error);
      return { success: false, error: error.message };
    }
  },

  // Submit insurance claim
  async submitClaim(policyId, claimAmount, description, proofHash) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const claimWei = ethers.utils.parseEther(claimAmount.toString());
      
      const tx = await contract.submitClaim(policyId, claimWei, description, proofHash);
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Claim submission error:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate premium
  async calculatePremium(insuranceType, coverageAmount) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const coverageWei = ethers.utils.parseEther(coverageAmount.toString());
      
      const typeMap = { 'flight': 0, 'car': 1, 'health': 2 };
      const typeEnum = typeMap[insuranceType.toLowerCase()];
      
      const premium = await contract.calculatePremium(typeEnum, coverageWei);
      return ethers.utils.formatEther(premium);
    } catch (error) {
      console.error('Calculate premium error:', error);
      return '0';
    }
  },

  // Get policy details
  async getPolicy(policyId) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const policy = await contract.getPolicy(policyId);
      
      return {
        policyId: policy.policyId.toNumber(),
        policyholder: policy.policyholder,
        insuranceType: INSURANCE_TYPE[policy.insuranceType],
        coverageAmount: ethers.utils.formatEther(policy.coverageAmount),
        premiumAmount: ethers.utils.formatEther(policy.premiumAmount),
        duration: policy.duration.toNumber(),
        startTime: policy.startTime.toNumber(),
        endTime: policy.endTime.toNumber(),
        status: POLICY_STATUS[policy.status],
        requestId: policy.requestId
      };
    } catch (error) {
      console.error('Get policy error:', error);
      return null;
    }
  },

  // Get holder's policies
  async getHolderPolicies(holderAddress) {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.SMART_INSURANCE, SMART_INSURANCE_ABI);
      const policyIds = await contract.getHolderPolicies(holderAddress);
      
      const policies = [];
      for (const policyId of policyIds) {
        const policy = await this.getPolicy(policyId.toNumber());
        if (policy) policies.push(policy);
      }
      
      return policies;
    } catch (error) {
      console.error('Get holder policies error:', error);
      return [];
    }
  }
};

/**
 * Utility functions
 */
export const web3Utils = {
  // Check if MetaMask is connected
  async isConnected() {
    try {
      const { provider } = await getWeb3Provider();
      const accounts = await provider.listAccounts();
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  },

  // Get current account
  async getCurrentAccount() {
    try {
      const { signer } = await getWeb3Provider();
      return await signer.getAddress();
    } catch (error) {
      return null;
    }
  },

  // Get account balance
  async getBalance(address) {
    try {
      const { provider } = await getWeb3Provider();
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      return '0';
    }
  },

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Convert wei to ether
  formatEther(wei) {
    return ethers.utils.formatEther(wei);
  },

  // Convert ether to wei
  parseEther(ether) {
    return ethers.utils.parseEther(ether.toString());
  }
};
