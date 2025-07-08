# Hedera Real Estate Tokenization Platform

A comprehensive platform for tokenizing real estate properties on the Hedera network, enabling fractional ownership and automated rent distribution.

## 🏆 Hackathon Project

This project is being developed for the **Hedera Hello Future: Origins Hackathon 2025** in the **DeFi/Tokenization** track.

## 🚀 Features

### Core Functionality
- **Property Tokenization**: Convert real estate properties into NFTs on Hedera
- **Fractional Ownership**: Enable multiple investors to own portions of properties through fungible tokens
- **Automated Rent Distribution**: Smart contract-based distribution of rental income to token holders
- **Portfolio Management**: Comprehensive dashboard for investors to track their investments
- **KYC Integration**: Compliance features for regulatory requirements

### Technical Features
- **Hedera Integration**: Built on Hedera Hashgraph for fast, secure, and low-cost transactions
- **Smart Contracts**: Solidity-based contracts for property management and token distribution
- **Modern Frontend**: Next.js with TypeScript and Tailwind CSS
- **Wallet Integration**: Support for Hedera wallet connections
- **Real-time Updates**: Live portfolio and investment tracking

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Hedera Hashgraph**: Primary blockchain platform
- **Hedera Token Service (HTS)**: For creating and managing tokens
- **Hedera Consensus Service (HCS)**: For immutable transaction logging
- **Solidity**: Smart contract development
- **Hardhat**: Development framework

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management
- **Recharts**: Data visualization

### Backend & Database
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: Document database for off-chain data
- **JWT**: Authentication and authorization

### Development Tools
- **ESLint**: Code linting
- **Jest**: Testing framework
- **Hardhat**: Smart contract testing and deployment

## 📁 Project Structure

```
hedera-real-estate-tokenization/
├── contracts/                 # Smart contracts
├── src/
│   ├── components/           # React components
│   ├── pages/               # Next.js pages
│   ├── utils/               # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Library configurations
│   └── styles/              # CSS and styling
├── public/                  # Static assets
├── scripts/                 # Deployment and utility scripts
├── test/                    # Test files
├── docs/                    # Documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Hedera testnet account
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hedera-real-estate-tokenization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Hedera credentials and other configuration values.

4. **Compile smart contracts**
   ```bash
   npm run compile-contracts
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Deployment

1. **Deploy smart contracts to testnet**
   ```bash
   npm run deploy-contracts
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📖 Usage

### For Property Owners
1. Connect your Hedera wallet
2. Complete KYC verification
3. List your property with required documentation
4. Set tokenization parameters (total tokens, price per token)
5. Deploy property NFT and fractional tokens
6. Manage rent collection and distribution

### For Investors
1. Connect your Hedera wallet
2. Complete KYC verification
3. Browse available properties
4. Purchase fractional ownership tokens
5. Track your portfolio and returns
6. Receive automated rent distributions

## 🔧 Configuration

### Hedera Network Configuration
- **Testnet**: For development and testing
- **Mainnet**: For production deployment

### Smart Contract Addresses
Contract addresses will be updated after deployment.

## 🤝 Contributing

This is a hackathon project, but contributions and feedback are welcome!

## 📄 License

MIT License - see LICENSE file for details.

## 🏆 Hackathon Information

- **Event**: Hedera Hello Future: Origins Hackathon 2025
- **Track**: DeFi/Tokenization
- **Prize Pool**: $150,000 USD
- **Platform**: DoraHacks

## 📞 Contact

For questions about this project, please reach out during the hackathon period.

---

**Built with ❤️ for the Hedera ecosystem**
