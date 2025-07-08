import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useWallet } from '@/lib/WalletContext'
import { hederaService } from '@/lib/HederaService'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const TestHederaPage: React.FC = () => {
  const { wallet, connectWallet, refreshBalance, sdkLoaded, hederaClient } = useWallet()
  const [testResults, setTestResults] = useState<{
    walletConnection: 'pending' | 'success' | 'error'
    sdkInitialization: 'pending' | 'success' | 'error'
    networkConnection: 'pending' | 'success' | 'error'
    balanceQuery: 'pending' | 'success' | 'error'
    serviceInitialization: 'pending' | 'success' | 'error'
  }>({
    walletConnection: 'pending',
    sdkInitialization: 'pending',
    networkConnection: 'pending',
    balanceQuery: 'pending',
    serviceInitialization: 'pending'
  })

  const [testLogs, setTestLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    addLog('Starting Hedera integration tests...')
    
    // Test 1: SDK Initialization
    addLog('Testing SDK initialization...')
    if (sdkLoaded) {
      setTestResults(prev => ({ ...prev, sdkInitialization: 'success' }))
      addLog('✅ Hedera SDK loaded successfully')
    } else {
      setTestResults(prev => ({ ...prev, sdkInitialization: 'error' }))
      addLog('❌ Hedera SDK failed to load')
    }

    // Test 2: Network Connection
    addLog('Testing network connection...')
    if (hederaClient) {
      setTestResults(prev => ({ ...prev, networkConnection: 'success' }))
      addLog('✅ Hedera client initialized')
    } else {
      setTestResults(prev => ({ ...prev, networkConnection: 'error' }))
      addLog('❌ Hedera client not initialized')
    }

    // Test 3: Service Initialization
    addLog('Testing Hedera service...')
    if (hederaService.isInitialized()) {
      setTestResults(prev => ({ ...prev, serviceInitialization: 'success' }))
      addLog('✅ Hedera service initialized')
    } else {
      setTestResults(prev => ({ ...prev, serviceInitialization: 'error' }))
      addLog('❌ Hedera service not initialized')
    }

    // Test 4: Wallet Connection
    if (wallet.isConnected) {
      setTestResults(prev => ({ ...prev, walletConnection: 'success' }))
      addLog('✅ Wallet connected')
      
      // Test 5: Balance Query
      if (wallet.balance) {
        setTestResults(prev => ({ ...prev, balanceQuery: 'success' }))
        addLog(`✅ Balance retrieved: ${wallet.balance} HBAR`)
      } else {
        setTestResults(prev => ({ ...prev, balanceQuery: 'error' }))
        addLog('❌ Failed to retrieve balance')
      }
    } else {
      setTestResults(prev => ({ ...prev, walletConnection: 'error' }))
      addLog('❌ Wallet not connected')
      setTestResults(prev => ({ ...prev, balanceQuery: 'error' }))
      addLog('❌ Cannot test balance without wallet connection')
    }

    addLog('Tests completed!')
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'Success'
      case 'error':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const testItems = [
    {
      name: 'Hedera SDK Initialization',
      status: testResults.sdkInitialization,
      description: 'Checks if @hashgraph/sdk is loaded and functional'
    },
    {
      name: 'Network Connection',
      status: testResults.networkConnection,
      description: 'Verifies connection to Hedera network'
    },
    {
      name: 'Service Initialization',
      status: testResults.serviceInitialization,
      description: 'Tests HederaService class initialization'
    },
    {
      name: 'Wallet Connection',
      status: testResults.walletConnection,
      description: 'Checks if wallet is connected and functional'
    },
    {
      name: 'Balance Query',
      status: testResults.balanceQuery,
      description: 'Tests account balance retrieval from network'
    }
  ]

  return (
    <>
      <Head>
        <title>Hedera Integration Test - RealEstateToken</title>
        <meta name="description" content="Test Hedera blockchain integration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Hedera Integration Test
            </h1>
            <p className="text-lg text-gray-600">
              Testing blockchain connectivity and wallet integration
            </p>
          </div>

          {/* Test Results */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Test Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CpuChipIcon className="w-6 h-6 mr-2" />
                Test Results
              </h2>
              
              <div className="space-y-4">
                {testItems.map((test, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {test.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          test.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : test.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusText(test.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {test.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={runTests}
                  className="btn-primary w-full"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Re-run Tests
                </button>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GlobeAltIcon className="w-6 h-6 mr-2" />
                Wallet Information
              </h2>
              
              {wallet.isConnected ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account ID</label>
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {wallet.accountId}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Balance</label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {wallet.balance || '0.00'} HBAR
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Network</label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {wallet.network || 'testnet'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">SDK Status</label>
                    <div className={`text-sm p-2 rounded ${
                      sdkLoaded ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {sdkLoaded ? 'Loaded' : 'Not Loaded'}
                    </div>
                  </div>
                  
                  <button
                    onClick={refreshBalance}
                    className="btn-secondary w-full mt-4"
                  >
                    Refresh Balance
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No wallet connected</p>
                  <button
                    onClick={connectWallet}
                    className="btn-primary"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Test Logs */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Logs
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {testLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {testLogs.length === 0 && (
                <div className="text-gray-500">No logs yet...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TestHederaPage
