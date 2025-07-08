// Core Types for Real Estate Tokenization Platform

export interface Property {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType: 'residential' | 'commercial' | 'industrial' | 'mixed-use';
  totalValue: number;
  totalTokens: number;
  availableTokens: number;
  tokenPrice: number;
  images: string[];
  documents: PropertyDocument[];
  owner: string;
  status: 'draft' | 'active' | 'sold-out' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  metadata: PropertyMetadata;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: 'deed' | 'appraisal' | 'inspection' | 'insurance' | 'other';
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface PropertyMetadata {
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  lotSize?: number;
  amenities?: string[];
  nearbyFacilities?: string[];
  expectedAnnualReturn?: number;
  rentPerMonth?: number;
  occupancyRate?: number;
  propertyTaxes?: number;
  maintenanceCosts?: number;
}

export interface Investment {
  id: string;
  investorId: string;
  propertyId: string;
  tokenAmount: number;
  investmentAmount: number;
  purchasePrice: number;
  transactionHash: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface RentDistribution {
  id: string;
  propertyId: string;
  totalRentCollected: number;
  distributionDate: Date;
  distributions: TokenHolderDistribution[];
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TokenHolderDistribution {
  investorId: string;
  tokenAmount: number;
  distributionAmount: number;
  transactionHash?: string;
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  profileImage?: string;
  userType: 'investor' | 'property-owner' | 'admin';
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  userId: string;
  investments: PortfolioInvestment[];
  totalInvested: number;
  totalValue: number;
  totalReturns: number;
  monthlyIncome: number;
}

export interface PortfolioInvestment {
  propertyId: string;
  property: Property;
  tokenAmount: number;
  investmentAmount: number;
  currentValue: number;
  totalReturns: number;
  monthlyIncome: number;
  roi: number;
}

// Hedera-specific types
export interface HederaConfig {
  network: 'testnet' | 'mainnet';
  accountId: string;
  privateKey: string;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  treasuryAccountId: string;
}

export interface NFTInfo {
  tokenId: string;
  serialNumber: number;
  accountId: string;
  metadata: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface PropertyFormData {
  name: string;
  description: string;
  address: Property['address'];
  propertyType: Property['propertyType'];
  totalValue: number;
  totalTokens: number;
  tokenPrice: number;
  images: File[];
  documents: File[];
  metadata: PropertyMetadata;
}

export interface InvestmentFormData {
  propertyId: string;
  tokenAmount: number;
  investmentAmount: number;
}

// Wallet types
export interface WalletState {
  isConnected: boolean;
  accountId: string | null;
  balance: string | null;
  network: string | null;
}

export interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  refreshBalance?: () => Promise<void>;
  switchNetwork?: (network: 'testnet' | 'mainnet') => Promise<void>;
  getAccountBalance?: (accountId: string) => Promise<string>;
  hederaClient?: any;
  sdkLoaded?: boolean;
}
