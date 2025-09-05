const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying Smart Contracts...");

  // Get the ContractFactory and Signer
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying contracts with the account:", deployerAddress);

  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", balance.toString());

  // Deploy SmartLoan contract
  console.log("\n📌 Deploying SmartLoan contract...");
  const SmartLoan = await ethers.getContractFactory("contracts/contracts/SmartLoan.sol:SmartLoan");
  const smartLoan = await SmartLoan.deploy();
  await smartLoan.waitForDeployment();
  console.log("SmartLoan deployed to:", await smartLoan.getAddress());

  // Deploy SmartInsurance contract
  console.log("\n📌 Deploying SmartInsurance contract...");
  const SmartInsurance = await ethers.getContractFactory("contracts/contracts/SmartInsurance.sol:SmartInsurance");
  const smartInsurance = await SmartInsurance.deploy();
  await smartInsurance.waitForDeployment();
  console.log("SmartInsurance deployed to:", await smartInsurance.getAddress());

  // Add initial funds to contracts
  console.log("\n💰 Adding initial funds to contracts...");

  // Add 10 ETH to loan lending pool
  const loanPoolAmount = ethers.parseEther("10.0"); // v6 syntax
  await (await smartLoan.addToLendingPool({ value: loanPoolAmount })).wait();
  console.log("✅ Added 10 ETH to SmartLoan lending pool");

  // Add 5 ETH to insurance pool
  const insurancePoolAmount = ethers.parseEther("5.0"); // v6 syntax
  await (await smartInsurance.addToInsurancePool({ value: insurancePoolAmount })).wait();
  console.log("✅ Added 5 ETH to SmartInsurance pool");

  // Deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("==================");
  console.log("SmartLoan Address:", await smartLoan.getAddress());
  console.log("SmartInsurance Address:", await smartInsurance.getAddress());
  console.log("Deployer Address:", deployerAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    smartLoan: {
      address: await smartLoan.getAddress(),
      deployer: deployerAddress,
    },
    smartInsurance: {
      address: await smartInsurance.getAddress(),
      deployer: deployerAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync("./deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
