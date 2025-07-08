import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet, getAvailableWallets } from '@/lib/WalletContext'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserIcon,
  WalletIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    switchNetwork,
    sdkLoaded
  } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // Check available wallets on mount
    const checkWallets = async () => {
      const wallets = await getAvailableWallets()
      setAvailableWallets(wallets)
    }
    checkWallets()
  }, [])

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWalletMenu) {
        setShowWalletMenu(false)
      }
    }

    if (showWalletMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showWalletMenu])

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
    { name: 'Portfolio', href: '/portfolio', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ]

  const handleWalletAction = async () => {
    if (wallet.isConnected) {
      setShowWalletMenu(!showWalletMenu)
    } else {
      await connectWallet()
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowWalletMenu(false)
  }

  const handleRefreshBalance = async () => {
    if (refreshBalance) {
      await refreshBalance()
    }
  }

  const handleNetworkSwitch = async (network: 'testnet' | 'mainnet') => {
    if (switchNetwork) {
      await switchNetwork(network)
      setShowWalletMenu(false)
    }
  }

  const formatAccountId = (accountId: string) => {
    if (!accountId) return ''
    return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                RealEstate<span className="text-primary-600">Token</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={handleWalletAction}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  wallet.isConnected
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                <span>
                  {wallet.isConnected
                    ? formatAccountId(wallet.accountId || '')
                    : 'Connect Wallet'
                  }
                </span>
                {wallet.isConnected && (
                  <div className="flex items-center space-x-1 ml-2">
                    {sdkLoaded && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>
                )}
              </button>

              {/* Wallet Menu */}
              {wallet.isConnected && showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {wallet.accountId}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-between">
                      <span>Balance: {wallet.balance || '0.00'} HBAR</span>
                      <button
                        onClick={handleRefreshBalance}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Refresh Balance"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Network: {wallet.network || 'testnet'}
                      {sdkLoaded && <span className="ml-2 text-green-600">● SDK Ready</span>}
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-700 mb-2 px-2">
                      Switch Network
                    </div>
                    <button
                      onClick={() => handleNetworkSwitch('testnet')}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        wallet.network === 'testnet' ? 'bg-primary-50 text-primary-700' : ''
                      }`}
                    >
                      <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                      Testnet
                    </button>
                    <button
                      onClick={() => handleNetworkSwitch('mainnet')}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        wallet.network === 'mainnet' ? 'bg-primary-50 text-primary-700' : ''
                      }`}
                    >
                      <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                      Mainnet
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Network Status */}
      {wallet.isConnected && (
        <div className="bg-primary-50 border-t border-primary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-primary-700">
                  Network: <span className="font-medium">{wallet.network || 'Testnet'}</span>
                </span>
                {wallet.balance && (
                  <span className="text-primary-700">
                    Balance: <span className="font-medium">{wallet.balance} HBAR</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-primary-600">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
