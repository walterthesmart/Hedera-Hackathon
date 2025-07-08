// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyNFT.sol";

/**
 * @title FractionalToken
 * @dev ERC20 token representing fractional ownership of real estate properties
 * Each property has its own fractional token with specific supply and pricing
 */
contract FractionalToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Reference to the PropertyNFT contract
    PropertyNFT public propertyNFT;
    
    // Property ID this token represents
    uint256 public propertyId;
    
    // Token information
    struct TokenInfo {
        uint256 totalSupply;
        uint256 availableSupply;
        uint256 pricePerToken;
        bool isActive;
        uint256 createdAt;
    }
    
    TokenInfo public tokenInfo;
    
    // Investment tracking
    struct Investment {
        address investor;
        uint256 amount;
        uint256 timestamp;
        uint256 pricePerToken;
    }
    
    // Mapping from investor to their investment details
    mapping(address => Investment[]) public investments;
    
    // Array of all investors
    address[] public investors;
    mapping(address => bool) public isInvestor;
    
    // Total amount invested
    uint256 public totalInvested;
    
    // Events
    event TokensPurchased(
        address indexed investor,
        uint256 amount,
        uint256 totalCost,
        uint256 pricePerToken
    );
    
    event TokensSold(
        address indexed investor,
        uint256 amount,
        uint256 totalReceived,
        uint256 pricePerToken
    );
    
    event PriceUpdated(uint256 newPrice);
    
    event TokenStatusChanged(bool isActive);
    
    modifier onlyKYCVerified() {
        require(propertyNFT.kycVerified(msg.sender), "KYC verification required");
        _;
    }
    
    modifier onlyPropertyOwner() {
        PropertyNFT.PropertyInfo memory property = propertyNFT.getProperty(propertyId);
        require(property.propertyOwner == msg.sender, "Not the property owner");
        _;
    }
    
    modifier onlyActiveToken() {
        require(tokenInfo.isActive, "Token is not active");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _propertyId,
        uint256 _totalSupply,
        uint256 _pricePerToken,
        address _propertyNFTAddress
    ) ERC20(name, symbol) {
        propertyId = _propertyId;
        propertyNFT = PropertyNFT(_propertyNFTAddress);
        
        tokenInfo = TokenInfo({
            totalSupply: _totalSupply,
            availableSupply: _totalSupply,
            pricePerToken: _pricePerToken,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Mint all tokens to this contract initially
        _mint(address(this), _totalSupply);
    }
    
    /**
     * @dev Purchase fractional tokens
     * @param tokenAmount Number of tokens to purchase
     */
    function purchaseTokens(uint256 tokenAmount) 
        public 
        payable 
        onlyKYCVerified 
        onlyActiveToken 
        whenNotPaused 
        nonReentrant 
    {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount <= tokenInfo.availableSupply, "Not enough tokens available");
        
        uint256 totalCost = tokenAmount * tokenInfo.pricePerToken;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update available supply
        tokenInfo.availableSupply -= tokenAmount;
        
        // Transfer tokens to investor
        _transfer(address(this), msg.sender, tokenAmount);
        
        // Record investment
        investments[msg.sender].push(Investment({
            investor: msg.sender,
            amount: tokenAmount,
            timestamp: block.timestamp,
            pricePerToken: tokenInfo.pricePerToken
        }));
        
        // Add to investors list if first investment
        if (!isInvestor[msg.sender]) {
            investors.push(msg.sender);
            isInvestor[msg.sender] = true;
        }
        
        totalInvested += totalCost;
        
        // Update PropertyNFT available tokens
        propertyNFT.updateAvailableTokens(propertyId, tokenInfo.availableSupply);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, tokenAmount, totalCost, tokenInfo.pricePerToken);
    }
    
    /**
     * @dev Sell fractional tokens back to the contract
     * @param tokenAmount Number of tokens to sell
     */
    function sellTokens(uint256 tokenAmount) 
        public 
        onlyKYCVerified 
        whenNotPaused 
        nonReentrant 
    {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 totalReceived = tokenAmount * tokenInfo.pricePerToken;
        require(address(this).balance >= totalReceived, "Insufficient contract balance");
        
        // Transfer tokens back to contract
        _transfer(msg.sender, address(this), tokenAmount);
        
        // Update available supply
        tokenInfo.availableSupply += tokenAmount;
        
        // Transfer payment to seller
        payable(msg.sender).transfer(totalReceived);
        
        // Update PropertyNFT available tokens
        propertyNFT.updateAvailableTokens(propertyId, tokenInfo.availableSupply);
        
        emit TokensSold(msg.sender, tokenAmount, totalReceived, tokenInfo.pricePerToken);
    }
    
    /**
     * @dev Update token price (only property owner)
     * @param newPrice New price per token
     */
    function updatePrice(uint256 newPrice) public onlyPropertyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tokenInfo.pricePerToken = newPrice;
        
        // Update PropertyNFT with new price
        PropertyNFT.PropertyInfo memory property = propertyNFT.getProperty(propertyId);
        propertyNFT.updateProperty(propertyId, property.totalValue, newPrice);
        
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @dev Set token active/inactive status (only property owner)
     * @param isActive New status
     */
    function setTokenStatus(bool isActive) public onlyPropertyOwner {
        tokenInfo.isActive = isActive;
        emit TokenStatusChanged(isActive);
    }
    
    /**
     * @dev Get investor count
     */
    function getInvestorCount() public view returns (uint256) {
        return investors.length;
    }
    
    /**
     * @dev Get all investors
     */
    function getInvestors() public view returns (address[] memory) {
        return investors;
    }
    
    /**
     * @dev Get investor's investment history
     * @param investor Address of the investor
     */
    function getInvestmentHistory(address investor) 
        public 
        view 
        returns (Investment[] memory) 
    {
        return investments[investor];
    }
    
    /**
     * @dev Get token information
     */
    function getTokenInfo() public view returns (TokenInfo memory) {
        return tokenInfo;
    }
    
    /**
     * @dev Calculate investor's ownership percentage
     * @param investor Address of the investor
     */
    function getOwnershipPercentage(address investor) 
        public 
        view 
        returns (uint256) 
    {
        uint256 investorBalance = balanceOf(investor);
        if (investorBalance == 0 || tokenInfo.totalSupply == 0) {
            return 0;
        }
        return (investorBalance * 10000) / tokenInfo.totalSupply; // Returns percentage * 100 (e.g., 1500 = 15.00%)
    }
    
    /**
     * @dev Withdraw contract balance (only property owner)
     */
    function withdrawBalance() public onlyPropertyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(msg.sender).transfer(balance);
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Override transfer to include KYC check
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        onlyKYCVerified 
        returns (bool) 
    {
        require(propertyNFT.kycVerified(to), "Recipient must be KYC verified");
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to include KYC check
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        onlyKYCVerified 
        returns (bool) 
    {
        require(propertyNFT.kycVerified(to), "Recipient must be KYC verified");
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Pause contract (emergency stop)
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
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
