// MetaMask utility functions for better wallet integration

export const MetaMaskUtils = {
  // Check if MetaMask is installed
  isInstalled: () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
  },

  // Check if MetaMask is unlocked
  isUnlocked: async () => {
    try {
      if (!MetaMaskUtils.isInstalled()) return false
      return await window.ethereum._metamask?.isUnlocked?.() ?? true
    } catch (error) {
      console.warn('Could not check MetaMask unlock status:', error)
      return true // Assume unlocked if we can't check
    }
  },

  // Get current network
  getCurrentNetwork: async () => {
    try {
      if (!MetaMaskUtils.isInstalled()) return null
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      return {
        chainId,
        name: MetaMaskUtils.getNetworkName(chainId)
      }
    } catch (error) {
      console.error('Error getting network:', error)
      return null
    }
  },

  // Get network name from chain ID
  getNetworkName: (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x2a': 'Kovan Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai Testnet',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Avalanche Fuji Testnet',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet'
    }
    return networks[chainId] || `Unknown Network (${chainId})`
  },

  // Check if we're on the correct network
  isCorrectNetwork: async (expectedChainId = '0x1') => {
    try {
      const network = await MetaMaskUtils.getCurrentNetwork()
      return network?.chainId === expectedChainId
    } catch (error) {
      console.error('Error checking network:', error)
      return false
    }
  },

  // Switch to a specific network
  switchNetwork: async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      })
      return true
    } catch (error) {
      console.error('Error switching network:', error)
      return false
    }
  },

  // Get account balance
  getBalance: async (address) => {
    try {
      if (!MetaMaskUtils.isInstalled() || !address) return '0'
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      // Convert from wei to ETH
      return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  },

  // Listen for account changes
  onAccountsChanged: (callback) => {
    if (!MetaMaskUtils.isInstalled()) return
    window.ethereum.on('accountsChanged', callback)
  },

  // Listen for network changes
  onChainChanged: (callback) => {
    if (!MetaMaskUtils.isInstalled()) return
    window.ethereum.on('chainChanged', callback)
  },

  // Remove event listeners
  removeAllListeners: () => {
    if (!MetaMaskUtils.isInstalled()) return
    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
  },

  // Comprehensive connection function
  connect: async (options = {}) => {
    const {
      expectedChainId = null,
      autoSwitchNetwork = false,
      timeout = 30000
    } = options

    try {
      // Check installation
      if (!MetaMaskUtils.isInstalled()) {
        throw new Error('MetaMask is not installed')
      }

      // Check if unlocked
      const isUnlocked = await MetaMaskUtils.isUnlocked()
      if (!isUnlocked) {
        throw new Error('MetaMask is locked')
      }

      // Check existing accounts first
      let accounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      // If no existing accounts, request connection
      if (!accounts || accounts.length === 0) {
        const connectPromise = window.ethereum.request({ method: 'eth_requestAccounts' })
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeout)
        )
        
        accounts = await Promise.race([connectPromise, timeoutPromise])
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available')
      }

      const address = accounts[0]

      // Check network if specified
      if (expectedChainId) {
        const isCorrectNetwork = await MetaMaskUtils.isCorrectNetwork(expectedChainId)
        if (!isCorrectNetwork) {
          if (autoSwitchNetwork) {
            const switched = await MetaMaskUtils.switchNetwork(expectedChainId)
            if (!switched) {
              throw new Error(`Please switch to the correct network: ${MetaMaskUtils.getNetworkName(expectedChainId)}`)
            }
          } else {
            const currentNetwork = await MetaMaskUtils.getCurrentNetwork()
            throw new Error(`Wrong network. Current: ${currentNetwork?.name}, Expected: ${MetaMaskUtils.getNetworkName(expectedChainId)}`)
          }
        }
      }

      // Get additional info
      const balance = await MetaMaskUtils.getBalance(address)
      const network = await MetaMaskUtils.getCurrentNetwork()

      return {
        success: true,
        address,
        balance,
        network,
        accounts
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }
}

export default MetaMaskUtils
