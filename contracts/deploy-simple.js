const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  try {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

    // Deploy SmartLoan
    console.log("\n--- Deploying SmartLoan ---");
    const SmartLoan = await hre.ethers.getContractFactory("SmartLoan");
    const smartLoan = await SmartLoan.deploy();
    await smartLoan.deployed();
    console.log("✅ SmartLoan deployed to:", smartLoan.address);

    // Deploy SmartInsurance
    console.log("\n--- Deploying SmartInsurance ---");
    const SmartInsurance = await hre.ethers.getContractFactory("SmartInsurance");
    const smartInsurance = await SmartInsurance.deploy();
    await smartInsurance.deployed();
    console.log("✅ SmartInsurance deployed to:", smartInsurance.address);

    // Add initial funds
    console.log("\n--- Adding Initial Funds ---");
    
    // Add 5 ETH to loan pool
    const loanPoolAmount = hre.ethers.utils.parseEther("5.0");
    const addLoanPoolTx = await smartLoan.addToLendingPool({ value: loanPoolAmount });
    await addLoanPoolTx.wait();
    console.log("✅ Added 5 ETH to loan pool");

    // Add 3 ETH to insurance pool
    const insurancePoolAmount = hre.ethers.utils.parseEther("3.0");
    const addInsurancePoolTx = await smartInsurance.addToInsurancePool({ value: insurancePoolAmount });
    await addInsurancePoolTx.wait();
    console.log("✅ Added 3 ETH to insurance pool");

    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log("SmartLoan Address:", smartLoan.address);
    console.log("SmartInsurance Address:", smartInsurance.address);
    console.log("\nUpdate these addresses in frontend/src/utils/web3.js");
    
    // Save addresses to file
    const addresses = {
      SMART_LOAN: smartLoan.address,
      SMART_INSURANCE: smartInsurance.address,
      NETWORK: "localhost",
      CHAIN_ID: 1337,
      DEPLOYED_AT: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("✅ Addresses saved to deployed-addresses.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
