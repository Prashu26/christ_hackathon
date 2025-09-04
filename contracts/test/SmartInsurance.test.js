const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartInsurance", function () {
  let SmartInsurance;
  let smartInsurance;
  let owner;
  let policyholder;
  let admin;
  let addrs;

  beforeEach(async function () {
    [owner, policyholder, admin, ...addrs] = await ethers.getSigners();
    
    SmartInsurance = await ethers.getContractFactory("SmartInsurance");
    smartInsurance = await SmartInsurance.deploy();
    await smartInsurance.deployed();
    
    // Add funds to insurance pool
    await smartInsurance.addToInsurancePool({ value: ethers.utils.parseEther("50") });
    
    // Set admin
    await smartInsurance.setAdmin(admin.address, true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await smartInsurance.owner()).to.equal(owner.address);
    });

    it("Should have insurance pool funds", async function () {
      expect(await smartInsurance.insurancePool()).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should set default premium rates", async function () {
      expect(await smartInsurance.premiumRates(0)).to.equal(200); // Flight: 2%
      expect(await smartInsurance.premiumRates(1)).to.equal(500); // Car: 5%
      expect(await smartInsurance.premiumRates(2)).to.equal(300); // Health: 3%
    });
  });

  describe("Policy Request", function () {
    it("Should allow policy request", async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 12;
      const requestId = "test-policy-1";

      await expect(
        smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId)
      ).to.emit(smartInsurance, "PolicyRequested");

      const policy = await smartInsurance.getPolicy(1);
      expect(policy.policyholder).to.equal(policyholder.address);
      expect(policy.coverageAmount).to.equal(coverageAmount);
      expect(policy.status).to.equal(0); // Pending
    });

    it("Should calculate correct premium", async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const expectedPremium = coverageAmount.mul(200).div(10000); // 2% for flight
      
      const actualPremium = await smartInsurance.calculatePremium(0, coverageAmount);
      expect(actualPremium).to.equal(expectedPremium);
    });

    it("Should reject duplicate request ID", async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 12;
      const requestId = "test-policy-1";

      await smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId);
      
      await expect(
        smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId)
      ).to.be.revertedWith("Request ID already used");
    });
  });

  describe("Policy Approval", function () {
    beforeEach(async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 12;
      const requestId = "test-policy-1";

      await smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId);
    });

    it("Should allow admin to approve policy", async function () {
      const policy = await smartInsurance.getPolicy(1);
      const premium = policy.premiumAmount;

      await expect(
        smartInsurance.connect(admin).approvePolicy(1, { value: premium })
      ).to.emit(smartInsurance, "PolicyActivated");

      const updatedPolicy = await smartInsurance.getPolicy(1);
      expect(updatedPolicy.status).to.equal(1); // Active
    });

    it("Should reject insufficient premium payment", async function () {
      const insufficientPremium = ethers.utils.parseEther("0.1");

      await expect(
        smartInsurance.connect(admin).approvePolicy(1, { value: insufficientPremium })
      ).to.be.revertedWith("Insufficient premium payment");
    });
  });

  describe("Premium Payment", function () {
    beforeEach(async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 12;
      const requestId = "test-policy-1";

      await smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId);
    });

    it("Should allow policyholder to pay premium", async function () {
      const policy = await smartInsurance.getPolicy(1);
      const premium = policy.premiumAmount;

      await expect(
        smartInsurance.connect(policyholder).payPremium(1, { value: premium })
      ).to.emit(smartInsurance, "PolicyActivated");

      const updatedPolicy = await smartInsurance.getPolicy(1);
      expect(updatedPolicy.status).to.equal(1); // Active
    });
  });

  describe("Claims", function () {
    beforeEach(async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 12;
      const requestId = "test-policy-1";

      await smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId);
      
      const policy = await smartInsurance.getPolicy(1);
      await smartInsurance.connect(policyholder).payPremium(1, { value: policy.premiumAmount });
    });

    it("Should allow claim submission", async function () {
      const claimAmount = ethers.utils.parseEther("5");
      const description = "Flight delayed by 4 hours";
      const proofHash = "QmTest123";

      await expect(
        smartInsurance.connect(policyholder).submitClaim(1, claimAmount, description, proofHash)
      ).to.emit(smartInsurance, "ClaimSubmitted");

      const claim = await smartInsurance.getClaim(1);
      expect(claim.claimant).to.equal(policyholder.address);
      expect(claim.claimAmount).to.equal(claimAmount);
      expect(claim.status).to.equal(0); // Pending
    });

    it("Should reject claim exceeding coverage", async function () {
      const excessiveClaimAmount = ethers.utils.parseEther("15"); // More than 10 ETH coverage
      const description = "Flight delayed";
      const proofHash = "QmTest123";

      await expect(
        smartInsurance.connect(policyholder).submitClaim(1, excessiveClaimAmount, description, proofHash)
      ).to.be.revertedWith("Invalid claim amount");
    });

    it("Should allow admin to approve claim", async function () {
      const claimAmount = ethers.utils.parseEther("5");
      const description = "Flight delayed by 4 hours";
      const proofHash = "QmTest123";

      await smartInsurance.connect(policyholder).submitClaim(1, claimAmount, description, proofHash);
      
      const payoutAmount = ethers.utils.parseEther("4");
      await expect(
        smartInsurance.connect(admin).processClaim(1, true, payoutAmount, "Approved - valid claim")
      ).to.emit(smartInsurance, "ClaimProcessed");

      const claim = await smartInsurance.getClaim(1);
      expect(claim.status).to.equal(3); // Paid
    });

    it("Should allow admin to reject claim", async function () {
      const claimAmount = ethers.utils.parseEther("5");
      const description = "Flight delayed by 4 hours";
      const proofHash = "QmTest123";

      await smartInsurance.connect(policyholder).submitClaim(1, claimAmount, description, proofHash);
      
      await expect(
        smartInsurance.connect(admin).processClaim(1, false, 0, "Insufficient proof")
      ).to.emit(smartInsurance, "ClaimProcessed");

      const claim = await smartInsurance.getClaim(1);
      expect(claim.status).to.equal(2); // Rejected
    });
  });

  describe("Policy Expiration", function () {
    beforeEach(async function () {
      const coverageAmount = ethers.utils.parseEther("10");
      const duration = 1; // 1 month for quick testing
      const requestId = "test-policy-1";

      await smartInsurance.connect(policyholder).requestPolicy(0, coverageAmount, duration, requestId);
      
      const policy = await smartInsurance.getPolicy(1);
      await smartInsurance.connect(policyholder).payPremium(1, { value: policy.premiumAmount });
    });

    it("Should allow policy expiration after end time", async function () {
      // Fast forward time by 31 days
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        smartInsurance.expirePolicy(1)
      ).to.emit(smartInsurance, "PolicyExpired");

      const policy = await smartInsurance.getPolicy(1);
      expect(policy.status).to.equal(2); // Expired
    });
  });
});
