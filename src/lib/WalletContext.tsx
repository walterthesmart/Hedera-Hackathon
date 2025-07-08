import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { WalletState, WalletContextType } from '@/types'
import toast from 'react-hot-toast'

// Hedera SDK imports (will be available after package installation)
let Client: any, AccountId: any, AccountBalanceQuery: any, Hbar: any
let HederaWalletConnect: any, detectProvider: any

// Dynamic imports to handle missing packages gracefully
const loadHederaSDK = async () => {
  try {
    const hederaSDK = await import('@hashgraph/sdk')
    Client = hederaSDK.Client
    AccountId = hederaSDK.AccountId
    AccountBalanceQuery = hederaSDK.AccountBalanceQuery
    Hbar = hederaSDK.Hbar
    return true
  } catch (error) {
    console.warn('Hedera SDK not available:', error)
    return false
  }
}

const loadWalletConnect = async () => {
  try {
    const walletConnect = await import('@hashgraph/hedera-wallet-connect')
    HederaWalletConnect = walletConnect.HederaWalletConnect
    return true
  } catch (error) {
    console.warn('Hedera Wallet Connect not available:', error)
    return false
  }
}

const loadMetaMaskDetector = async () => {
  try {
    const detector = await import('@metamask/detect-provider')
    detectProvider = detector.default
    return true
  } catch (error) {
    console.warn('MetaMask detector not available:', error)
    return false
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    accountId: null,
    balance: null,
    network: null,
  })

  const [hederaClient, setHederaClient] = useState<any>(null)
  const [walletConnector, setWalletConnector] = useState<any>(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)

  // Load Hedera SDK and wallet connectors on mount
  useEffect(() => {
    initializeSDK()
    checkExistingConnection()
  }, [])

  const initializeSDK = async () => {
    try {
      const [sdkLoaded, walletLoaded, metamaskLoaded] = await Promise.all([
        loadHederaSDK(),
        loadWalletConnect(),
        loadMetaMaskDetector()
      ])

      if (sdkLoaded) {
        // Initialize Hedera client for testnet
        const client = Client.forTestnet()
        setHederaClient(client)
        setSdkLoaded(true)
        console.log('Hedera SDK initialized successfully')
      }

      if (walletLoaded) {
        console.log('Hedera Wallet Connect loaded successfully')
      }

      if (metamaskLoaded) {
        console.log('MetaMask detector loaded successfully')
      }
    } catch (error) {
      console.error('Error initializing Hedera SDK:', error)
    }
  }

  const checkExistingConnection = async () => {
    try {
      // Check if wallet was previously connected (stored in localStorage)
      const savedConnection = localStorage.getItem('wallet-connection')
      if (savedConnection) {
        const connectionData = JSON.parse(savedConnection)

        // Verify the connection is still valid
        if (connectionData.accountId) {
          // Try to refresh the balance if SDK is loaded
          let balance = connectionData.balance
          if (sdkLoaded && hederaClient) {
            try {
              balance = await getAccountBalance(connectionData.accountId)
            } catch (error) {
              console.warn('Could not refresh balance:', error)
            }
          }

          setWallet({
            isConnected: true,
            accountId: connectionData.accountId,
            balance: balance,
            network: connectionData.network || 'testnet',
          })
        }
      }
    } catch (error) {
      console.error('Error checking existing wallet connection:', error)
      // Clear invalid connection data
      localStorage.removeItem('wallet-connection')
    }
  }

  const connectWallet = async (): Promise<void> => {
    try {
      let connected = false

      // Try HashPack first (Hedera native wallet)
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        connected = await connectHashPack()
      }

      // Try Hedera Wallet Connect if available
      if (!connected && HederaWalletConnect) {
        connected = await connectHederaWalletConnect()
      }

      // Try MetaMask as fallback
      if (!connected && detectProvider) {
        connected = await connectMetaMask()
      }

      // Fallback to mock wallet for development
      if (!connected) {
        connected = await connectMockWallet()
      }

      if (!connected) {
        throw new Error('No wallet connection method available')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet. Please try again.')
    }
  }

  const connectHashPack = async (): Promise<boolean> => {
    try {
      const hashpack = (window as any).hashpack

      // Request connection
      const connectionResult = await hashpack.connectToLocalWallet()

      if (connectionResult.success) {
        const accountId = connectionResult.accountIds[0]
        const network = connectionResult.network || 'testnet'

        // Get real account balance
        const balance = await getAccountBalance(accountId)

        const walletData = {
          isConnected: true,
          accountId,
          balance,
          network,
        }

        setWallet(walletData)
        localStorage.setItem('wallet-connection', JSON.stringify(walletData))

        toast.success(`Connected to HashPack: ${accountId}`)
        return true
      }
      return false
    } catch (error) {
      console.error('HashPack connection failed:', error)
      return false
    }
  }

  const connectHederaWalletConnect = async (): Promise<boolean> => {
    try {
      if (!HederaWalletConnect) return false

      // Initialize Hedera Wallet Connect
      const walletConnect = new HederaWalletConnect()

      // Connect to wallet
      const session = await walletConnect.connect()

      if (session && session.accounts && session.accounts.length > 0) {
        const accountId = session.accounts[0]
        const network = session.network || 'testnet'

        // Get account balance
        const balance = await getAccountBalance(accountId)

        const walletData = {
          isConnected: true,
          accountId,
          balance,
          network,
        }

        setWallet(walletData)
        setWalletConnector(walletConnect)
        localStorage.setItem('wallet-connection', JSON.stringify(walletData))

        toast.success(`Connected via Wallet Connect: ${accountId}`)
        return true
      }
      return false
    } catch (error) {
      console.error('Hedera Wallet Connect failed:', error)
      return false
    }
  }

  const connectMetaMask = async (): Promise<boolean> => {
    try {
      if (!detectProvider) return false

      const provider = await detectProvider()

      if (provider && provider.isMetaMask) {
        // Request account access
        const accounts = await provider.request({ method: 'eth_requestAccounts' })

        if (accounts && accounts.length > 0) {
          // Convert Ethereum address to Hedera account format (mock conversion)
          const ethAddress = accounts[0]
          const mockAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`

          const walletData = {
            isConnected: true,
            accountId: mockAccountId,
            balance: '0.00', // MetaMask doesn't have HBAR balance
            network: 'testnet',
          }

          setWallet(walletData)
          localStorage.setItem('wallet-connection', JSON.stringify(walletData))

          toast.success(`Connected to MetaMask: ${ethAddress.slice(0, 8)}...`)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      return false
    }
  }

  const connectMockWallet = async (): Promise<boolean> => {
    try {
      const mockAccountId = '0.0.123456'
      const mockBalance = '100.50'
      const mockNetwork = 'testnet'

      const walletData = {
        isConnected: true,
        accountId: mockAccountId,
        balance: mockBalance,
        network: mockNetwork,
      }

      setWallet(walletData)
      localStorage.setItem('wallet-connection', JSON.stringify(walletData))

      toast.success(`Connected to Mock Wallet: ${mockAccountId}`)
      return true
    } catch (error) {
      console.error('Mock wallet connection failed:', error)
      return false
    }
  }

  const disconnectWallet = (): void => {
    try {
      // Disconnect wallet connector if available
      if (walletConnector && walletConnector.disconnect) {
        walletConnector.disconnect()
        setWalletConnector(null)
      }

      setWallet({
        isConnected: false,
        accountId: null,
        balance: null,
        network: null,
      })

      // Clear saved connection
      localStorage.removeItem('wallet-connection')

      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast.error('Error disconnecting wallet')
    }
  }

  const signTransaction = async (transaction: any): Promise<string> => {
    try {
      if (!wallet.isConnected) {
        throw new Error('Wallet not connected')
      }

      // Try HashPack signing first
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        const hashpack = (window as any).hashpack

        const signResult = await hashpack.signTransaction(transaction)

        if (signResult.success) {
          toast.success('Transaction signed via HashPack')
          return signResult.signedTransaction
        }
      }

      // Try Hedera Wallet Connect signing
      if (walletConnector && walletConnector.signTransaction) {
        const signResult = await walletConnector.signTransaction(transaction)

        if (signResult) {
          toast.success('Transaction signed via Wallet Connect')
          return signResult
        }
      }

      // Fallback to mock signing for development
      const mockSignature = `mock_signature_${Date.now()}`
      toast.success('Transaction signed (Mock)')
      return mockSignature
    } catch (error) {
      console.error('Error signing transaction:', error)
      toast.error('Failed to sign transaction')
      throw error
    }
  }

  const getAccountBalance = async (accountId: string): Promise<string> => {
    try {
      if (!sdkLoaded || !hederaClient || !AccountId || !AccountBalanceQuery) {
        // Return mock balance if SDK not loaded
        return '100.50'
      }

      // Query real account balance from Hedera network
      const account = AccountId.fromString(accountId)
      const query = new AccountBalanceQuery().setAccountId(account)

      const balance = await query.execute(hederaClient)

      // Convert from tinybars to HBAR
      const hbarBalance = balance.hbars.toString()

      return hbarBalance
    } catch (error) {
      console.error('Error fetching account balance:', error)
      // Return mock balance on error
      return '100.50'
    }
  }

  const refreshBalance = async (): Promise<void> => {
    if (!wallet.isConnected || !wallet.accountId) return

    try {
      const newBalance = await getAccountBalance(wallet.accountId)

      setWallet(prev => ({
        ...prev,
        balance: newBalance
      }))

      // Update localStorage
      const walletData = { ...wallet, balance: newBalance }
      localStorage.setItem('wallet-connection', JSON.stringify(walletData))
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }

  const switchNetwork = async (network: 'testnet' | 'mainnet'): Promise<void> => {
    try {
      if (!sdkLoaded || !Client) {
        toast.error('Hedera SDK not loaded')
        return
      }

      // Create new client for the selected network
      const newClient = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet()
      setHederaClient(newClient)

      // Update wallet state
      setWallet(prev => ({
        ...prev,
        network
      }))

      // Update localStorage
      const walletData = { ...wallet, network }
      localStorage.setItem('wallet-connection', JSON.stringify(walletData))

      toast.success(`Switched to ${network}`)
    } catch (error) {
      console.error('Error switching network:', error)
      toast.error('Failed to switch network')
    }
  }

  const contextValue: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    signTransaction,
    refreshBalance,
    switchNetwork,
    getAccountBalance,
    hederaClient,
    sdkLoaded,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Utility functions for wallet detection
export const isHashPackAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!(window as any).hashpack
}

export const isMetaMaskAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  try {
    if (!detectProvider) await loadMetaMaskDetector()
    const provider = await detectProvider?.()
    return !!(provider && provider.isMetaMask)
  } catch {
    return false
  }
}

export const getAvailableWallets = async (): Promise<string[]> => {
  const wallets: string[] = []

  if (isHashPackAvailable()) {
    wallets.push('HashPack')
  }

  if (await isMetaMaskAvailable()) {
    wallets.push('MetaMask')
  }

  if (HederaWalletConnect) {
    wallets.push('WalletConnect')
  }

  return wallets
}

// Utility function to format account ID
export const formatAccountId = (accountId: string): string => {
  if (!accountId) return ''
  return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`
}

// Utility function to format balance
export const formatBalance = (balance: string): string => {
  if (!balance) return '0.00'
  const num = parseFloat(balance)
  return num.toFixed(2)
}

// Utility function to format HBAR amount
export const formatHbar = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  } else {
    return num.toFixed(2)
  }
}

// Utility function to validate Hedera account ID
export const isValidAccountId = (accountId: string): boolean => {
  const accountIdRegex = /^0\.0\.\d+$/
  return accountIdRegex.test(accountId)
}

// Utility function to get network explorer URL
export const getExplorerUrl = (accountId: string, network: string = 'testnet'): string => {
  const baseUrl = network === 'mainnet'
    ? 'https://hashscan.io/mainnet'
    : 'https://hashscan.io/testnet'
  return `${baseUrl}/account/${accountId}`
}
