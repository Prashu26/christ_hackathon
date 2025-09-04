const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartLoan", function () {
  let SmartLoan;
  let smartLoan;
  let owner;
  let borrower;
  let admin;
  let addrs;

  beforeEach(async function () {
    [owner, borrower, admin, ...addrs] = await ethers.getSigners();
    
    SmartLoan = await ethers.getContractFactory("SmartLoan");
    smartLoan = await SmartLoan.deploy();
    await smartLoan.deployed();
    
    // Add funds to lending pool
    await smartLoan.addToLendingPool({ value: ethers.utils.parseEther("100") });
    
    // Set admin
    await smartLoan.setAdmin(admin.address, true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await smartLoan.owner()).to.equal(owner.address);
    });

    it("Should have lending pool funds", async function () {
      expect(await smartLoan.totalLendingPool()).to.equal(ethers.utils.parseEther("100"));
    });
  });

  describe("Loan Request", function () {
    it("Should allow loan request", async function () {
      const amount = ethers.utils.parseEther("1");
      const interestRate = 500; // 5%
      const duration = 12; // months
      const requestId = "test-request-1";

      await expect(
        smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId)
      ).to.emit(smartLoan, "LoanRequested");

      const loan = await smartLoan.getLoan(1);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.amount).to.equal(amount);
      expect(loan.status).to.equal(0); // Pending
    });

    it("Should reject duplicate request ID", async function () {
      const amount = ethers.utils.parseEther("1");
      const interestRate = 500;
      const duration = 12;
      const requestId = "test-request-1";

      await smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId);
      
      await expect(
        smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId)
      ).to.be.revertedWith("Request ID already used");
    });
  });

  describe("Loan Approval", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("1");
      const interestRate = 500;
      const duration = 12;
      const requestId = "test-request-1";

      await smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId);
    });

    it("Should allow admin to approve loan", async function () {
      await expect(
        smartLoan.connect(admin).approveLoan(1)
      ).to.emit(smartLoan, "LoanApproved");

      const loan = await smartLoan.getLoan(1);
      expect(loan.status).to.equal(1); // Approved
    });

    it("Should reject non-admin approval", async function () {
      await expect(
        smartLoan.connect(borrower).approveLoan(1)
      ).to.be.revertedWith("Not authorized admin");
    });
  });

  describe("Loan Activation", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("1");
      const interestRate = 500;
      const duration = 12;
      const requestId = "test-request-1";

      await smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId);
      await smartLoan.connect(admin).approveLoan(1);
    });

    it("Should activate loan with sufficient collateral", async function () {
      const collateral = ethers.utils.parseEther("1.5"); // 150% collateral

      await expect(
        smartLoan.connect(borrower).activateLoan(1, { value: collateral })
      ).to.emit(smartLoan, "LoanActivated");

      const loan = await smartLoan.getLoan(1);
      expect(loan.status).to.equal(2); // Active
      expect(loan.collateralAmount).to.equal(collateral);
    });

    it("Should reject insufficient collateral", async function () {
      const insufficientCollateral = ethers.utils.parseEther("1.0"); // Only 100%

      await expect(
        smartLoan.connect(borrower).activateLoan(1, { value: insufficientCollateral })
      ).to.be.revertedWith("Insufficient collateral");
    });
  });

  describe("Loan Repayment", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("1");
      const interestRate = 500;
      const duration = 12;
      const requestId = "test-request-1";
      const collateral = ethers.utils.parseEther("1.5");

      await smartLoan.connect(borrower).requestLoan(amount, interestRate, duration, requestId);
      await smartLoan.connect(admin).approveLoan(1);
      await smartLoan.connect(borrower).activateLoan(1, { value: collateral });
    });

    it("Should allow loan repayment", async function () {
      const totalOwed = await smartLoan.calculateTotalOwed(1);
      
      await expect(
        smartLoan.connect(borrower).repayLoan(1, { value: totalOwed })
      ).to.emit(smartLoan, "LoanRepaid");

      const loan = await smartLoan.getLoan(1);
      expect(loan.status).to.equal(3); // Repaid
    });

    it("Should calculate correct total owed", async function () {
      const loan = await smartLoan.getLoan(1);
      const expectedInterest = loan.amount.mul(500).div(10000); // 5% interest
      const expectedTotal = loan.amount.add(expectedInterest);
      
      const actualTotal = await smartLoan.calculateTotalOwed(1);
      expect(actualTotal).to.equal(expectedTotal);
    });
  });
});
