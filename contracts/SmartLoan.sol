// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SmartLoan
 * @dev A decentralized loan system with admin approval workflow
 */
contract SmartLoan {
    
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 amount;
        uint256 interestRate; // in basis points (e.g., 500 = 5%)
        uint256 duration; // in months
        uint256 collateralAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 repaidAmount;
        LoanStatus status;
        string requestId; // Links to backend approval system
    }
    
    enum LoanStatus {
        Pending,
        Approved,
        Active,
        Repaid,
        Defaulted,
        Rejected
    }
    
    // Events
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, string requestId);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanActivated(uint256 indexed loanId, address indexed borrower, uint256 collateral);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event CollateralWithdrawn(uint256 indexed loanId, address indexed borrower, uint256 amount);
    
    // State variables
    address public owner;
    uint256 public nextLoanId = 1;
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization
    uint256 public constant BASIS_POINTS = 10000;
    bool public paused = false;
    
    // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(string => uint256) public requestIdToLoanId;
    mapping(address => bool) public approvedAdmins;
    
    // Contract balance for lending
    uint256 public totalLendingPool;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyAdmin() {
        require(approvedAdmins[msg.sender] || msg.sender == owner, "Not authorized admin");
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
    
    modifier validLoan(uint256 _loanId) {
        require(_loanId > 0 && _loanId < nextLoanId, "Invalid loan ID");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        approvedAdmins[msg.sender] = true;
        _status = _NOT_ENTERED;
    }
    
    /**
     * @dev Add funds to the lending pool
     */
    function addToLendingPool() external payable onlyOwner {
        totalLendingPool += msg.value;
    }
    
    /**
     * @dev Add or remove admin
     */
    function setAdmin(address _admin, bool _status) external onlyOwner {
        approvedAdmins[_admin] = _status;
    }
    
    /**
     * @dev Request a loan (links with backend approval system)
     */
    function requestLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        string memory _requestId
    ) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_interestRate > 0 && _interestRate <= 2000, "Invalid interest rate"); // Max 20%
        require(_duration >= 1 && _duration <= 60, "Duration must be 1-60 months");
        require(bytes(_requestId).length > 0, "Request ID required");
        require(requestIdToLoanId[_requestId] == 0, "Request ID already used");
        
        uint256 loanId = nextLoanId++;
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            duration: _duration,
            collateralAmount: 0,
            startTime: 0,
            endTime: 0,
            repaidAmount: 0,
            status: LoanStatus.Pending,
            requestId: _requestId
        });
        
        borrowerLoans[msg.sender].push(loanId);
        requestIdToLoanId[_requestId] = loanId;
        
        emit LoanRequested(loanId, msg.sender, _amount, _requestId);
    }
    
    /**
     * @dev Approve loan (called by admin after backend approval)
     */
    function approveLoan(uint256 _loanId) external onlyAdmin validLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan not in pending status");
        require(totalLendingPool >= loan.amount, "Insufficient lending pool");
        
        loan.status = LoanStatus.Approved;
        
        emit LoanApproved(_loanId, loan.borrower, loan.amount);
    }
    
    /**
     * @dev Reject loan (called by admin)
     */
    function rejectLoan(uint256 _loanId) external onlyAdmin validLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan not in pending status");
        
        loan.status = LoanStatus.Rejected;
    }
    
    /**
     * @dev Activate loan by providing collateral
     */
    function activateLoan(uint256 _loanId) external payable nonReentrant validLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Approved, "Loan not approved");
        require(msg.sender == loan.borrower, "Not the borrower");
        
        uint256 requiredCollateral = (loan.amount * COLLATERAL_RATIO) / 100;
        require(msg.value >= requiredCollateral, "Insufficient collateral");
        
        loan.collateralAmount = msg.value;
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.endTime = block.timestamp + (loan.duration * 30 days);
        
        totalLendingPool -= loan.amount;
        
        // Transfer loan amount to borrower
        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");
        
        emit LoanActivated(_loanId, loan.borrower, loan.collateralAmount);
    }
    
    /**
     * @dev Repay loan
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant validLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.sender == loan.borrower, "Not the borrower");
        
        uint256 totalOwed = calculateTotalOwed(_loanId);
        require(msg.value >= totalOwed, "Insufficient repayment amount");
        
        loan.repaidAmount = msg.value;
        loan.status = LoanStatus.Repaid;
        
        // Return collateral to borrower
        uint256 collateralToReturn = loan.collateralAmount;
        loan.collateralAmount = 0;
        
        // Add repayment to lending pool
        totalLendingPool += msg.value;
        
        // Return collateral
        (bool success, ) = payable(loan.borrower).call{value: collateralToReturn}("");
        require(success, "Collateral return failed");
        
        emit LoanRepaid(_loanId, loan.borrower, msg.value);
        emit CollateralWithdrawn(_loanId, loan.borrower, collateralToReturn);
    }
    
    /**
     * @dev Mark loan as defaulted (admin only)
     */
    function markAsDefaulted(uint256 _loanId) external onlyAdmin validLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.endTime, "Loan not yet expired");
        
        loan.status = LoanStatus.Defaulted;
        
        // Collateral goes to the lending pool
        totalLendingPool += loan.collateralAmount;
        loan.collateralAmount = 0;
        
        emit LoanDefaulted(_loanId, loan.borrower);
    }
    
    /**
     * @dev Calculate total amount owed including interest
     */
    function calculateTotalOwed(uint256 _loanId) public view validLoan(_loanId) returns (uint256) {
        Loan memory loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        
        uint256 interest = (loan.amount * loan.interestRate) / BASIS_POINTS;
        return loan.amount + interest;
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 _loanId) external view validLoan(_loanId) returns (Loan memory) {
        return loans[_loanId];
    }
    
    /**
     * @dev Get borrower's loans
     */
    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }
    
    /**
     * @dev Get loan by request ID
     */
    function getLoanByRequestId(string memory _requestId) external view returns (Loan memory) {
        uint256 loanId = requestIdToLoanId[_requestId];
        require(loanId > 0, "Request ID not found");
        return loans[loanId];
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
        require(_amount <= address(this).balance - totalLendingPool, "Cannot withdraw lending pool");
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
}
