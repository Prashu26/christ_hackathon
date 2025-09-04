# Smart Contracts Deployment Guide

## ✅ Issue Fixed: OpenZeppelin Dependencies Removed

The HH1006 error has been resolved by removing all OpenZeppelin dependencies and implementing security features directly in the contracts.

## 📋 Prerequisites

1. **Node.js** installed (v16+ recommended)
2. **MetaMask** browser extension
3. **Git** (optional)

## 🚀 Step-by-Step Deployment

### 1. Start Local Blockchain

Open a **new terminal** and run:

```bash
cd "d:\demo hackathon\hackathon1\contracts"
npx hardhat node
```

**Keep this terminal running!** You should see:
- Local blockchain started at `http://127.0.0.1:8545/`
- 20 test accounts with 10,000 ETH each
- Account addresses and private keys

### 2. Deploy Contracts

In a **second terminal**, run:

```bash
cd "d:\demo hackathon\hackathon1\contracts"
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
Deploying Smart Contracts...
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0

SmartLoan deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
SmartInsurance deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. Update Frontend Configuration

Copy the deployed contract addresses and update `frontend/src/utils/web3.js`:

```javascript
export const CONTRACT_ADDRESSES = {
  SMART_LOAN: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Replace with actual
  SMART_INSURANCE: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" // Replace with actual
};
```

### 4. Configure MetaMask

1. **Add Local Network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Copy a private key from the hardhat node output
   - Import into MetaMask
   - You should see 10,000 ETH balance

### 5. Start Frontend

```bash
cd "d:\demo hackathon\hackathon1\frontend"
npm start
```

### 6. Start Backend

```bash
cd "d:\demo hackathon\hackathon1\backend"
npm start
```

## 🔧 Alternative Deployment (If Issues Persist)

If the main deployment doesn't work, use the simplified script:

```bash
cd "d:\demo hackathon\hackathon1\contracts"
npx hardhat run deploy-simple.js --network localhost
```

This will:
- Deploy both contracts
- Add initial funds (5 ETH to loan pool, 3 ETH to insurance pool)
- Save addresses to `deployed-addresses.json`

## 🧪 Testing the Integration

### Test Loan Functionality:
1. Navigate to Loan page in frontend
2. Request a loan (e.g., 1 ETH, 5% interest, 12 months)
3. Check MetaMask for transaction confirmation
4. Verify loan appears in dashboard

### Test Insurance Functionality:
1. Navigate to Insurance page
2. Request policy (e.g., Flight insurance, 2 ETH coverage, 6 months)
3. Pay premium when prompted
4. Submit a test claim

## 🐛 Troubleshooting

### Contract Compilation Issues:
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

### Network Connection Issues:
- Ensure MetaMask is connected to local network (Chain ID: 1337)
- Check that hardhat node is still running
- Refresh browser and reconnect MetaMask

### Transaction Failures:
- Check account has sufficient ETH balance
- Verify contract addresses are correct
- Check browser console for detailed errors

## 📁 Contract Features

### SmartLoan.sol:
- ✅ Loan request/approval workflow
- ✅ Collateral management (150% ratio)
- ✅ Interest calculation
- ✅ Repayment handling
- ✅ Built-in security (reentrancy protection, access control)

### SmartInsurance.sol:
- ✅ Policy management (Flight, Car, Health)
- ✅ Premium calculation (2%, 5%, 3% respectively)
- ✅ Claims processing
- ✅ Admin approval workflow
- ✅ Built-in security features

## 🎯 Next Steps

1. **Deploy contracts** using the instructions above
2. **Update contract addresses** in frontend configuration
3. **Test all functionality** with MetaMask
4. **Deploy to testnet** (Sepolia/Goerli) for production testing

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all terminals are running
3. Ensure MetaMask is properly configured
4. Check that contract addresses match deployment output
