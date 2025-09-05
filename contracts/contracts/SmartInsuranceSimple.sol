// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";

/**
 * @title SmartInsurance
 * @dev A decentralized insurance system with admin approval workflow
 */
contract SmartInsurance {
    
    struct Policy {
        uint256 policyId;
        address policyholder;
        InsuranceType insuranceType;
        uint256 coverageAmount;
        uint256 premiumAmount;
        uint256 duration; // in months
        uint256 startTime;
        uint256 endTime;
        PolicyStatus status;
        string requestId; // Links to backend approval system
    }
    
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        string description;
        string proofHash; // IPFS hash of proof documents
        uint256 submittedAt;
        uint256 processedAt;
        ClaimStatus status;
        string adminNotes;
    }
    
    enum InsuranceType {
        Flight,
        Car,
        Health
    }
    
    enum PolicyStatus {
        Pending,
        Active,
        Expired,
        Cancelled,
        Rejected
    }
    
    enum ClaimStatus {
        Pending,
        Approved,
        Rejected,
        Paid
    }
    
    // Events
    event PolicyRequested(uint256 indexed policyId, address indexed policyholder, InsuranceType insuranceType, string requestId);
    event PolicyActivated(uint256 indexed policyId, address indexed policyholder, uint256 premium);
    event PolicyExpired(uint256 indexed policyId, address indexed policyholder);
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant, uint256 amount);
    event ClaimProcessed(uint256 indexed claimId, ClaimStatus status, uint256 payoutAmount);
    event PremiumPaid(uint256 indexed policyId, address indexed policyholder, uint256 amount);
    
    // State variables
    address public owner;
    uint256 public nextPolicyId = 1;
    uint256 public nextClaimId = 1;
    bool public paused = false;
    
    // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public holderPolicies;
    mapping(uint256 => uint256[]) public policyClaims;
    mapping(string => uint256) public requestIdToPolicyId;
    mapping(address => bool) public approvedAdmins;
    
    // Insurance pool for payouts
    uint256 public insurancePool;
    
    // Premium rates per insurance type (in basis points)
    mapping(InsuranceType => uint256) public premiumRates;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyAdmin() {
        require(approvedAdmins[msg.sender] || msg.sender == owner, "Not authorized admin");
        _;
    }
    
    modifier validPolicy(uint256 _policyId) {
        require(_policyId > 0 && _policyId < nextPolicyId, "Invalid policy ID");
        _;
    }
    
    modifier validClaim(uint256 _claimId) {
        require(_claimId > 0 && _claimId < nextClaimId, "Invalid claim ID");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
    
    constructor() {
        owner = msg.sender;
        approvedAdmins[msg.sender] = true;
        _status = _NOT_ENTERED;
        
        // Set default premium rates (2% for flight, 5% for car, 3% for health)
        premiumRates[InsuranceType.Flight] = 200;
        premiumRates[InsuranceType.Car] = 500;
        premiumRates[InsuranceType.Health] = 300;
    }
    
    /**
     * @dev Add funds to insurance pool
     */
    function addToInsurancePool() external payable onlyOwner {
        insurancePool += msg.value;
    }
    
    /**
     * @dev Set admin status
     */
    function setAdmin(address _admin, bool _status) external onlyOwner {
        approvedAdmins[_admin] = _status;
    }
    
    /**
     * @dev Set premium rate for insurance type
     */
    function setPremiumRate(InsuranceType _type, uint256 _rate) external onlyOwner {
        require(_rate <= 1000, "Rate cannot exceed 10%");
        premiumRates[_type] = _rate;
    }
    
    /**
     * @dev Request insurance policy (links with backend approval system)
     */
    function requestPolicy(
        InsuranceType _insuranceType,
        uint256 _coverageAmount,
        uint256 _duration,
        string memory _requestId
    ) external whenNotPaused {
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        require(_duration >= 1 && _duration <= 60, "Duration must be 1-60 months");
        require(bytes(_requestId).length > 0, "Request ID required");
        require(requestIdToPolicyId[_requestId] == 0, "Request ID already used");
        
        uint256 policyId = nextPolicyId++;
        uint256 premiumAmount = (_coverageAmount * premiumRates[_insuranceType]) / 10000;
        
        policies[policyId] = Policy({
            policyId: policyId,
            policyholder: msg.sender,
            insuranceType: _insuranceType,
            coverageAmount: _coverageAmount,
            premiumAmount: premiumAmount,
            duration: _duration,
            startTime: 0,
            endTime: 0,
            status: PolicyStatus.Pending,
            requestId: _requestId
        });
        
        holderPolicies[msg.sender].push(policyId);
        requestIdToPolicyId[_requestId] = policyId;
        
        emit PolicyRequested(policyId, msg.sender, _insuranceType, _requestId);
    }
    
    /**
     * @dev Approve and activate policy (admin only, after backend approval)
     */
    function approvePolicy(uint256 _policyId) external payable onlyAdmin validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Pending, "Policy not in pending status");
        require(msg.value >= policy.premiumAmount, "Insufficient premium payment");
        
        policy.status = PolicyStatus.Active;
        policy.startTime = block.timestamp;
        policy.endTime = block.timestamp + (policy.duration * 30 days);
        
        // Add premium to insurance pool
        insurancePool += msg.value;
        
        emit PolicyActivated(_policyId, policy.policyholder, msg.value);
        emit PremiumPaid(_policyId, policy.policyholder, msg.value);
    }
    
    /**
     * @dev Reject policy (admin only)
     */
    function rejectPolicy(uint256 _policyId) external onlyAdmin validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Pending, "Policy not in pending status");
        
        policy.status = PolicyStatus.Rejected;
    }
    
    /**
     * @dev Pay premium to activate approved policy
     */
    function payPremium(uint256 _policyId) external payable nonReentrant validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Pending, "Policy not approved");
        require(msg.sender == policy.policyholder, "Not the policyholder");
        require(msg.value >= policy.premiumAmount, "Insufficient premium payment");
        
        policy.status = PolicyStatus.Active;
        policy.startTime = block.timestamp;
        policy.endTime = block.timestamp + (policy.duration * 30 days);
        
        // Add premium to insurance pool
        insurancePool += msg.value;
        
        emit PolicyActivated(_policyId, policy.policyholder, msg.value);
        emit PremiumPaid(_policyId, policy.policyholder, msg.value);
    }
    
    /**
     * @dev Submit insurance claim
     */
    function submitClaim(
        uint256 _policyId,
        uint256 _claimAmount,
        string memory _description,
        string memory _proofHash
    ) external whenNotPaused validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(msg.sender == policy.policyholder, "Not the policyholder");
        require(block.timestamp <= policy.endTime, "Policy expired");
        require(_claimAmount > 0 && _claimAmount <= policy.coverageAmount, "Invalid claim amount");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_proofHash).length > 0, "Proof hash required");
        
        uint256 claimId = nextClaimId++;
        
        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            claimant: msg.sender,
            claimAmount: _claimAmount,
            description: _description,
            proofHash: _proofHash,
            submittedAt: block.timestamp,
            processedAt: 0,
            status: ClaimStatus.Pending,
            adminNotes: ""
        });
        
        policyClaims[_policyId].push(claimId);
        
        emit ClaimSubmitted(claimId, _policyId, msg.sender, _claimAmount);
    }
    
    /**
     * @dev Process claim (admin only)
     */
    function processClaim(
        uint256 _claimId,
        bool _approve,
        uint256 _payoutAmount,
        string memory _adminNotes
    ) external onlyAdmin nonReentrant validClaim(_claimId) {
        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.Pending, "Claim already processed");
        
        claim.processedAt = block.timestamp;
        claim.adminNotes = _adminNotes;
        
        if (_approve) {
            require(_payoutAmount > 0 && _payoutAmount <= claim.claimAmount, "Invalid payout amount");
            require(insurancePool >= _payoutAmount, "Insufficient insurance pool");
            
            claim.status = ClaimStatus.Approved;
            
            // Transfer payout to claimant
            insurancePool -= _payoutAmount;
            (bool success, ) = payable(claim.claimant).call{value: _payoutAmount}("");
            require(success, "Payout transfer failed");
            
            claim.status = ClaimStatus.Paid;
            
            emit ClaimProcessed(_claimId, ClaimStatus.Paid, _payoutAmount);
        } else {
            claim.status = ClaimStatus.Rejected;
            emit ClaimProcessed(_claimId, ClaimStatus.Rejected, 0);
        }
    }
    
    /**
     * @dev Expire policies (can be called by anyone)
     */
    function expirePolicy(uint256 _policyId) external validPolicy(_policyId) {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(block.timestamp > policy.endTime, "Policy not yet expired");
        
        policy.status = PolicyStatus.Expired;
        
        emit PolicyExpired(_policyId, policy.policyholder);
    }
    
    /**
     * @dev Get policy details
     */
    function getPolicy(uint256 _policyId) external view validPolicy(_policyId) returns (Policy memory) {
        return policies[_policyId];
    }
    
    /**
     * @dev Get claim details
     */
    function getClaim(uint256 _claimId) external view validClaim(_claimId) returns (Claim memory) {
        return claims[_claimId];
    }
    
    /**
     * @dev Get policyholder's policies
     */
    function getHolderPolicies(address _holder) external view returns (uint256[] memory) {
        return holderPolicies[_holder];
    }
    
    /**
     * @dev Get policy claims
     */
    function getPolicyClaims(uint256 _policyId) external view validPolicy(_policyId) returns (uint256[] memory) {
        return policyClaims[_policyId];
    }
    
    /**
     * @dev Get policy by request ID
     */
    function getPolicyByRequestId(string memory _requestId) external view returns (Policy memory) {
        uint256 policyId = requestIdToPolicyId[_requestId];
        require(policyId > 0, "Request ID not found");
        return policies[policyId];
    }
    
    /**
     * @dev Calculate premium for coverage amount and type
     */
    function calculatePremium(InsuranceType _type, uint256 _coverageAmount) external view returns (uint256) {
        return (_coverageAmount * premiumRates[_type]) / 10000;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        paused = true;
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        paused = false;
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance - insurancePool, "Cannot withdraw insurance pool");
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
}
