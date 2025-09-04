import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { web3Utils } from '../utils/web3';

const Web3Integration = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await web3Utils.isConnected();
      setIsConnected(connected);
      
      if (connected) {
        const currentAccount = await web3Utils.getCurrentAccount();
        const accountBalance = await web3Utils.getBalance(currentAccount);
        setAccount(currentAccount);
        setBalance(accountBalance);
        
        if (onConnectionChange) {
          onConnectionChange({ connected: true, account: currentAccount, balance: accountBalance });
        }
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setError('Failed to check wallet connection');
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount('');
      setBalance('0');
      if (onConnectionChange) {
        onConnectionChange({ connected: false, account: '', balance: '0' });
      }
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
      if (onConnectionChange) {
        onConnectionChange({ connected: true, account: accounts[0], balance });
      }
    }
  };

  const updateBalance = async (address) => {
    try {
      const newBalance = await web3Utils.getBalance(address);
      setBalance(newBalance);
    } catch (err) {
      console.error('Failed to update balance:', err);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await checkConnection();
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    setBalance('0');
    setError('');
    
    if (onConnectionChange) {
      onConnectionChange({ connected: false, account: '', balance: '0' });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <p className="text-white/60 text-sm">Connect your MetaMask wallet to interact with smart contracts</p>
            </div>
          </div>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>{web3Utils.formatAddress(account)}</span>
              <ExternalLink 
                className="w-3 h-3 cursor-pointer hover:text-white" 
                onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
              />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">{parseFloat(balance).toFixed(4)} ETH</div>
          <button
            onClick={disconnectWallet}
            className="text-red-400 hover:text-red-300 text-sm mt-1"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default Web3Integration;
