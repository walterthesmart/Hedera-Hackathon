const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of Real Estate Tokenization Platform contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy PropertyNFT contract
  console.log("\n1. Deploying PropertyNFT contract...");
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy();
  await propertyNFT.deployed();
  console.log("PropertyNFT deployed to:", propertyNFT.address);

  // Deploy RentDistribution contract
  console.log("\n2. Deploying RentDistribution contract...");
  const RentDistribution = await ethers.getContractFactory("RentDistribution");
  const rentDistribution = await RentDistribution.deploy(propertyNFT.address);
  await rentDistribution.deployed();
  console.log("RentDistribution deployed to:", rentDistribution.address);

  // Deploy PropertyManager contract
  console.log("\n3. Deploying PropertyManager contract...");
  const PropertyManager = await ethers.getContractFactory("PropertyManager");
  const propertyManager = await PropertyManager.deploy(
    propertyNFT.address,
    rentDistribution.address
  );
  await propertyManager.deployed();
  console.log("PropertyManager deployed to:", propertyManager.address);

  // Set up permissions and configurations
  console.log("\n4. Setting up contract permissions...");

  // Set PropertyManager as owner of PropertyNFT for minting
  console.log("Setting PropertyManager as authorized minter for PropertyNFT...");
  await propertyNFT.transferOwnership(propertyManager.address);

  // Set PropertyManager as owner of RentDistribution
  console.log("Setting PropertyManager as owner of RentDistribution...");
  await rentDistribution.transferOwnership(propertyManager.address);

  // Verify KYC for deployer (for testing)
  console.log("Setting KYC verification for deployer...");
  await propertyManager.batchSetKYCStatus([deployer.address], true);

  console.log("\n5. Deployment Summary:");
  console.log("=".repeat(50));
  console.log("PropertyNFT:", propertyNFT.address);
  console.log("RentDistribution:", rentDistribution.address);
  console.log("PropertyManager:", propertyManager.address);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50));

  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PropertyNFT: propertyNFT.address,
      RentDistribution: rentDistribution.address,
      PropertyManager: propertyManager.address
    },
    transactionHashes: {
      PropertyNFT: propertyNFT.deployTransaction.hash,
      RentDistribution: rentDistribution.deployTransaction.hash,
      PropertyManager: propertyManager.deployTransaction.hash
    }
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to deployments/${hre.network.name}-deployment.json`);

  // Create environment variables file for frontend
  const envContent = `
# Hedera Contract Addresses - ${hre.network.name}
NEXT_PUBLIC_PROPERTY_NFT_CONTRACT=${propertyNFT.address}
NEXT_PUBLIC_PROPERTY_MANAGER_CONTRACT=${propertyManager.address}
NEXT_PUBLIC_RENT_DISTRIBUTION_CONTRACT=${rentDistribution.address}
NEXT_PUBLIC_HEDERA_NETWORK=${hre.network.name}

# Add these to your .env.local file
`;

  fs.writeFileSync(
    `deployments/${hre.network.name}-env-vars.txt`,
    envContent
  );

  console.log(`Environment variables saved to deployments/${hre.network.name}-env-vars.txt`);

  // Verify contracts on Etherscan (if not local network)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n6. Verifying contracts on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: propertyNFT.address,
        constructorArguments: [],
      });
      console.log("PropertyNFT verified");
    } catch (error) {
      console.log("PropertyNFT verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: rentDistribution.address,
        constructorArguments: [propertyNFT.address],
      });
      console.log("RentDistribution verified");
    } catch (error) {
      console.log("RentDistribution verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: propertyManager.address,
        constructorArguments: [propertyNFT.address, rentDistribution.address],
      });
      console.log("PropertyManager verified");
    } catch (error) {
      console.log("PropertyManager verification failed:", error.message);
    }
  }

  console.log("\n✅ Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update your frontend configuration with the new contract addresses");
  console.log("2. Set up your environment variables with the contract addresses");
  console.log("3. Test the contracts with the provided test scripts");
  console.log("4. Configure your frontend to interact with the deployed contracts");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
