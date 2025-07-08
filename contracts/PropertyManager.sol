// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyNFT.sol";
import "./FractionalToken.sol";
import "./RentDistribution.sol";

/**
 * @title PropertyManager
 * @dev Central management contract for the real estate tokenization platform
 * Coordinates PropertyNFT, FractionalToken, and RentDistribution contracts
 */
contract PropertyManager is Ownable, Pausable, ReentrancyGuard {
    
    // Contract references
    PropertyNFT public propertyNFT;
    RentDistribution public rentDistribution;
    
    // Property to fractional token mapping
    mapping(uint256 => address) public propertyToFractionalToken;
    
    // Fractional token factory tracking
    mapping(address => bool) public isValidFractionalToken;
    
    // Property creation fee
    uint256 public propertyCreationFee = 0.01 ether;
    
    // Platform statistics
    uint256 public totalProperties;
    uint256 public totalInvestments;
    uint256 public totalValueLocked;
    
    // Events
    event PropertyCreated(
        uint256 indexed propertyId,
        address indexed owner,
        address fractionalTokenAddress,
        string name,
        uint256 totalValue
    );
    
    event InvestmentMade(
        uint256 indexed propertyId,
        address indexed investor,
        uint256 tokenAmount,
        uint256 investmentAmount
    );
    
    event PropertyCreationFeeUpdated(uint256 newFee);
    
    modifier onlyValidProperty(uint256 propertyId) {
        require(propertyId < totalProperties, "Invalid property ID");
        _;
    }
    
    modifier onlyPropertyOwner(uint256 propertyId) {
        PropertyNFT.PropertyInfo memory property = propertyNFT.getProperty(propertyId);
        require(property.propertyOwner == msg.sender, "Not the property owner");
        _;
    }
    
    constructor(
        address _propertyNFTAddress,
        address _rentDistributionAddress
    ) {
        propertyNFT = PropertyNFT(_propertyNFTAddress);
        rentDistribution = RentDistribution(_rentDistributionAddress);
    }
    
    /**
     * @dev Create a new tokenized property
     * @param name Property name
     * @param description Property description
     * @param propertyType Type of property
     * @param totalValue Total property value
     * @param totalTokens Total fractional tokens
     * @param tokenPrice Price per fractional token
     * @param metadataURI IPFS URI for metadata
     * @param tokenName Name for fractional token
     * @param tokenSymbol Symbol for fractional token
     */
    function createProperty(
        string memory name,
        string memory description,
        string memory propertyType,
        uint256 totalValue,
        uint256 totalTokens,
        uint256 tokenPrice,
        string memory metadataURI,
        string memory tokenName,
        string memory tokenSymbol
    ) public payable whenNotPaused nonReentrant returns (uint256 propertyId, address fractionalTokenAddress) {
        require(msg.value >= propertyCreationFee, "Insufficient creation fee");
        require(propertyNFT.kycVerified(msg.sender), "KYC verification required");
        require(totalValue > 0, "Total value must be greater than 0");
        require(totalTokens > 0, "Total tokens must be greater than 0");
        require(tokenPrice > 0, "Token price must be greater than 0");
        require(totalValue == totalTokens * tokenPrice, "Value and token calculation mismatch");
        
        // Mint Property NFT
        propertyId = propertyNFT.mintProperty(
            msg.sender,
            name,
            description,
            propertyType,
            totalValue,
            totalTokens,
            tokenPrice,
            metadataURI
        );
        
        // Deploy Fractional Token contract
        FractionalToken fractionalToken = new FractionalToken(
            tokenName,
            tokenSymbol,
            propertyId,
            totalTokens,
            tokenPrice,
            address(propertyNFT)
        );
        
        fractionalTokenAddress = address(fractionalToken);
        
        // Register mappings
        propertyToFractionalToken[propertyId] = fractionalTokenAddress;
        isValidFractionalToken[fractionalTokenAddress] = true;
        
        // Register with rent distribution contract
        rentDistribution.registerFractionalToken(propertyId, fractionalTokenAddress);
        
        // Update statistics
        totalProperties++;
        totalValueLocked += totalValue;
        
        // Refund excess payment
        if (msg.value > propertyCreationFee) {
            payable(msg.sender).transfer(msg.value - propertyCreationFee);
        }
        
        emit PropertyCreated(propertyId, msg.sender, fractionalTokenAddress, name, totalValue);
        
        return (propertyId, fractionalTokenAddress);
    }
    
    /**
     * @dev Invest in a property by purchasing fractional tokens
     * @param propertyId Property ID to invest in
     * @param tokenAmount Number of tokens to purchase
     */
    function investInProperty(uint256 propertyId, uint256 tokenAmount)
        public
        payable
        onlyValidProperty(propertyId)
        whenNotPaused
        nonReentrant
    {
        require(propertyNFT.kycVerified(msg.sender), "KYC verification required");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        
        address fractionalTokenAddress = propertyToFractionalToken[propertyId];
        require(fractionalTokenAddress != address(0), "Fractional token not found");
        
        FractionalToken fractionalToken = FractionalToken(fractionalTokenAddress);
        
        // Purchase tokens (this will handle payment and validation)
        fractionalToken.purchaseTokens{value: msg.value}(tokenAmount);
        
        // Update statistics
        totalInvestments++;
        
        emit InvestmentMade(propertyId, msg.sender, tokenAmount, msg.value);
    }
    
    /**
     * @dev Get property details with fractional token info
     * @param propertyId Property ID
     */
    function getPropertyDetails(uint256 propertyId)
        public
        view
        onlyValidProperty(propertyId)
        returns (
            PropertyNFT.PropertyInfo memory propertyInfo,
            address fractionalTokenAddress,
            uint256 availableTokens,
            uint256 currentPrice,
            uint256 investorCount
        )
    {
        propertyInfo = propertyNFT.getProperty(propertyId);
        fractionalTokenAddress = propertyToFractionalToken[propertyId];
        
        if (fractionalTokenAddress != address(0)) {
            FractionalToken fractionalToken = FractionalToken(fractionalTokenAddress);
            FractionalToken.TokenInfo memory tokenInfo = fractionalToken.getTokenInfo();
            
            availableTokens = tokenInfo.availableSupply;
            currentPrice = tokenInfo.pricePerToken;
            investorCount = fractionalToken.getInvestorCount();
        }
    }
    
    /**
     * @dev Get all properties (paginated)
     * @param offset Starting index
     * @param limit Number of properties to return
     */
    function getProperties(uint256 offset, uint256 limit)
        public
        view
        returns (uint256[] memory propertyIds, address[] memory fractionalTokens)
    {
        require(offset < totalProperties, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > totalProperties) {
            end = totalProperties;
        }
        
        uint256 length = end - offset;
        propertyIds = new uint256[](length);
        fractionalTokens = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 propertyId = offset + i;
            propertyIds[i] = propertyId;
            fractionalTokens[i] = propertyToFractionalToken[propertyId];
        }
    }
    
    /**
     * @dev Get investor's portfolio
     * @param investor Investor address
     */
    function getInvestorPortfolio(address investor)
        public
        view
        returns (
            uint256[] memory propertyIds,
            uint256[] memory tokenBalances,
            uint256[] memory ownershipPercentages
        )
    {
        // Count investor's properties
        uint256 count = 0;
        for (uint256 i = 0; i < totalProperties; i++) {
            address fractionalTokenAddress = propertyToFractionalToken[i];
            if (fractionalTokenAddress != address(0)) {
                FractionalToken fractionalToken = FractionalToken(fractionalTokenAddress);
                if (fractionalToken.balanceOf(investor) > 0) {
                    count++;
                }
            }
        }
        
        // Populate arrays
        propertyIds = new uint256[](count);
        tokenBalances = new uint256[](count);
        ownershipPercentages = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < totalProperties; i++) {
            address fractionalTokenAddress = propertyToFractionalToken[i];
            if (fractionalTokenAddress != address(0)) {
                FractionalToken fractionalToken = FractionalToken(fractionalTokenAddress);
                uint256 balance = fractionalToken.balanceOf(investor);
                
                if (balance > 0) {
                    propertyIds[index] = i;
                    tokenBalances[index] = balance;
                    ownershipPercentages[index] = fractionalToken.getOwnershipPercentage(investor);
                    index++;
                }
            }
        }
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats()
        public
        view
        returns (
            uint256 _totalProperties,
            uint256 _totalInvestments,
            uint256 _totalValueLocked,
            uint256 _totalUsers
        )
    {
        return (
            totalProperties,
            totalInvestments,
            totalValueLocked,
            propertyNFT.getTotalProperties()
        );
    }
    
    /**
     * @dev Update property creation fee (only owner)
     * @param newFee New creation fee
     */
    function updatePropertyCreationFee(uint256 newFee) public onlyOwner {
        propertyCreationFee = newFee;
        emit PropertyCreationFeeUpdated(newFee);
    }
    
    /**
     * @dev Set KYC status for multiple users (only owner)
     * @param users Array of user addresses
     * @param verified Verification status
     */
    function batchSetKYCStatus(address[] memory users, bool verified)
        public
        onlyOwner
    {
        propertyNFT.batchSetKYCStatus(users, verified);
    }
    
    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdrawFees() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency pause all operations
     */
    function emergencyPause() public onlyOwner {
        _pause();
        propertyNFT.pause();
        rentDistribution.pause();
    }
    
    /**
     * @dev Emergency unpause all operations
     */
    function emergencyUnpause() public onlyOwner {
        _unpause();
        propertyNFT.unpause();
        rentDistribution.unpause();
    }
    
    /**
     * @dev Pause contract
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
