const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Smart Contracts...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy SmartLoan contract
  console.log("\nDeploying SmartLoan contract...");
  const SmartLoan = await ethers.getContractFactory("SmartLoan");
  const smartLoan = await SmartLoan.deploy();
  await smartLoan.deployed();
  console.log("SmartLoan deployed to:", smartLoan.address);

  // Deploy SmartInsurance contract
  console.log("\nDeploying SmartInsurance contract...");
  const SmartInsurance = await ethers.getContractFactory("SmartInsurance");
  const smartInsurance = await SmartInsurance.deploy();
  await smartInsurance.deployed();
  console.log("SmartInsurance deployed to:", smartInsurance.address);

  // Add initial funds to contracts (optional)
  console.log("\nAdding initial funds to contracts...");
  
  // Add 10 ETH to loan lending pool
  const loanPoolAmount = ethers.utils.parseEther("10.0");
  await smartLoan.addToLendingPool({ value: loanPoolAmount });
  console.log("Added 10 ETH to SmartLoan lending pool");

  // Add 5 ETH to insurance pool
  const insurancePoolAmount = ethers.utils.parseEther("5.0");
  await smartInsurance.addToInsurancePool({ value: insurancePoolAmount });
  console.log("Added 5 ETH to SmartInsurance pool");

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("SmartLoan Address:", smartLoan.address);
  console.log("SmartInsurance Address:", smartInsurance.address);
  console.log("Deployer Address:", deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    smartLoan: {
      address: smartLoan.address,
      deployer: deployer.address
    },
    smartInsurance: {
      address: smartInsurance.address,
      deployer: deployer.address
    },
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    './deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
