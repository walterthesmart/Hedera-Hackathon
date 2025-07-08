// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./PropertyNFT.sol";
import "./FractionalToken.sol";

/**
 * @title RentDistribution
 * @dev Contract for automated rent collection and distribution to token holders
 * Distributes rental income proportionally based on token ownership
 */
contract RentDistribution is Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    // Reference to PropertyNFT contract
    PropertyNFT public propertyNFT;

    // Distribution information
    struct Distribution {
        uint256 propertyId;
        address fractionalTokenAddress;
        uint256 totalRentCollected;
        uint256 distributionDate;
        uint256 totalTokensAtDistribution;
        bool isCompleted;
        mapping(address => uint256) investorDistributions;
        mapping(address => bool) claimed;
        address[] investors;
        uint256 totalDistributed;
        uint256 platformFee;
        uint256 propertyOwnerFee;
    }

    // Mapping from distribution ID to distribution info
    mapping(uint256 => Distribution) public distributions;
    uint256 public distributionCounter;

    // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250; // 2.5%
    
    // Property owner management fee percentage (in basis points)
    uint256 public managementFeePercentage = 500; // 5%

    // Mapping from property ID to fractional token address
    mapping(uint256 => address) public propertyToToken;

    // Mapping from property ID to total rent collected
    mapping(uint256 => uint256) public totalRentCollected;

    // Events
    event RentDeposited(
        uint256 indexed propertyId,
        uint256 amount,
        address indexed depositor
    );

    event DistributionCreated(
        uint256 indexed distributionId,
        uint256 indexed propertyId,
        uint256 totalAmount,
        uint256 investorCount
    );

    event RentDistributed(
        uint256 indexed distributionId,
        address indexed investor,
        uint256 amount
    );

    event DistributionCompleted(
        uint256 indexed distributionId,
        uint256 totalDistributed
    );

    event FeesUpdated(
        uint256 platformFeePercentage,
        uint256 managementFeePercentage
    );

    modifier onlyPropertyOwner(uint256 propertyId) {
        PropertyNFT.PropertyInfo memory property = propertyNFT.getProperty(propertyId);
        require(property.propertyOwner == msg.sender, "Not the property owner");
        _;
    }

    constructor(address _propertyNFTAddress) {
        propertyNFT = PropertyNFT(_propertyNFTAddress);
    }

    /**
     * @dev Register fractional token for a property
     * @param propertyId Property ID
     * @param tokenAddress Fractional token contract address
     */
    function registerFractionalToken(uint256 propertyId, address tokenAddress)
        public
        onlyOwner
    {
        require(tokenAddress != address(0), "Invalid token address");
        propertyToToken[propertyId] = tokenAddress;
    }

    /**
     * @dev Deposit rent for a property
     * @param propertyId Property ID to deposit rent for
     */
    function depositRent(uint256 propertyId)
        public
        payable
        onlyPropertyOwner(propertyId)
        whenNotPaused
    {
        require(msg.value > 0, "Rent amount must be greater than 0");
        require(propertyToToken[propertyId] != address(0), "Fractional token not registered");

        totalRentCollected[propertyId] = totalRentCollected[propertyId].add(msg.value);

        emit RentDeposited(propertyId, msg.value, msg.sender);
    }

    /**
     * @dev Create and execute rent distribution
     * @param propertyId Property ID to distribute rent for
     * @param rentAmount Amount of rent to distribute
     */
    function createDistribution(uint256 propertyId, uint256 rentAmount)
        public
        onlyPropertyOwner(propertyId)
        whenNotPaused
        nonReentrant
    {
        require(rentAmount > 0, "Rent amount must be greater than 0");
        require(address(this).balance >= rentAmount, "Insufficient contract balance");
        require(propertyToToken[propertyId] != address(0), "Fractional token not registered");

        FractionalToken fractionalToken = FractionalToken(propertyToToken[propertyId]);
        
        // Calculate fees
        uint256 platformFee = rentAmount.mul(platformFeePercentage).div(10000);
        uint256 managementFee = rentAmount.mul(managementFeePercentage).div(10000);
        uint256 distributionAmount = rentAmount.sub(platformFee).sub(managementFee);

        uint256 distributionId = distributionCounter++;
        Distribution storage distribution = distributions[distributionId];
        
        distribution.propertyId = propertyId;
        distribution.fractionalTokenAddress = propertyToToken[propertyId];
        distribution.totalRentCollected = rentAmount;
        distribution.distributionDate = block.timestamp;
        distribution.totalTokensAtDistribution = fractionalToken.totalSupply();
        distribution.isCompleted = false;
        distribution.platformFee = platformFee;
        distribution.propertyOwnerFee = managementFee;

        // Get all investors
        address[] memory investors = fractionalToken.getInvestors();
        distribution.investors = investors;

        // Calculate distributions for each investor
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorBalance = fractionalToken.balanceOf(investor);
            
            if (investorBalance > 0) {
                uint256 investorShare = distributionAmount.mul(investorBalance).div(distribution.totalTokensAtDistribution);
                distribution.investorDistributions[investor] = investorShare;
            }
        }

        // Transfer fees
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        PropertyNFT.PropertyInfo memory property = propertyNFT.getProperty(propertyId);
        if (managementFee > 0) {
            payable(property.propertyOwner).transfer(managementFee);
        }

        emit DistributionCreated(distributionId, propertyId, distributionAmount, investors.length);
    }

    /**
     * @dev Claim rent distribution (investors call this)
     * @param distributionId Distribution ID to claim from
     */
    function claimDistribution(uint256 distributionId)
        public
        whenNotPaused
        nonReentrant
    {
        Distribution storage distribution = distributions[distributionId];
        require(!distribution.isCompleted, "Distribution already completed");
        require(!distribution.claimed[msg.sender], "Already claimed");
        
        uint256 amount = distribution.investorDistributions[msg.sender];
        require(amount > 0, "No distribution available");

        distribution.claimed[msg.sender] = true;
        distribution.totalDistributed = distribution.totalDistributed.add(amount);

        payable(msg.sender).transfer(amount);

        emit RentDistributed(distributionId, msg.sender, amount);

        // Check if all distributions are claimed
        _checkDistributionCompletion(distributionId);
    }

    /**
     * @dev Batch distribute rent to all investors (gas-intensive, use carefully)
     * @param distributionId Distribution ID to execute
     */
    function batchDistribute(uint256 distributionId)
        public
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        Distribution storage distribution = distributions[distributionId];
        require(!distribution.isCompleted, "Distribution already completed");

        for (uint256 i = 0; i < distribution.investors.length; i++) {
            address investor = distribution.investors[i];
            
            if (!distribution.claimed[investor]) {
                uint256 amount = distribution.investorDistributions[investor];
                
                if (amount > 0) {
                    distribution.claimed[investor] = true;
                    distribution.totalDistributed = distribution.totalDistributed.add(amount);
                    
                    payable(investor).transfer(amount);
                    emit RentDistributed(distributionId, investor, amount);
                }
            }
        }

        _checkDistributionCompletion(distributionId);
    }

    /**
     * @dev Check if distribution is completed
     */
    function _checkDistributionCompletion(uint256 distributionId) internal {
        Distribution storage distribution = distributions[distributionId];
        
        bool allClaimed = true;
        for (uint256 i = 0; i < distribution.investors.length; i++) {
            address investor = distribution.investors[i];
            if (distribution.investorDistributions[investor] > 0 && !distribution.claimed[investor]) {
                allClaimed = false;
                break;
            }
        }

        if (allClaimed && !distribution.isCompleted) {
            distribution.isCompleted = true;
            emit DistributionCompleted(distributionId, distribution.totalDistributed);
        }
    }

    /**
     * @dev Get distribution information
     * @param distributionId Distribution ID
     */
    function getDistribution(uint256 distributionId)
        public
        view
        returns (
            uint256 propertyId,
            address fractionalTokenAddress,
            uint256 totalRentCollected,
            uint256 distributionDate,
            uint256 totalTokensAtDistribution,
            bool isCompleted,
            uint256 totalDistributed,
            uint256 platformFee,
            uint256 propertyOwnerFee
        )
    {
        Distribution storage distribution = distributions[distributionId];
        return (
            distribution.propertyId,
            distribution.fractionalTokenAddress,
            distribution.totalRentCollected,
            distribution.distributionDate,
            distribution.totalTokensAtDistribution,
            distribution.isCompleted,
            distribution.totalDistributed,
            distribution.platformFee,
            distribution.propertyOwnerFee
        );
    }

    /**
     * @dev Get investor's distribution amount
     * @param distributionId Distribution ID
     * @param investor Investor address
     */
    function getInvestorDistribution(uint256 distributionId, address investor)
        public
        view
        returns (uint256 amount, bool claimed)
    {
        Distribution storage distribution = distributions[distributionId];
        return (
            distribution.investorDistributions[investor],
            distribution.claimed[investor]
        );
    }

    /**
     * @dev Get distribution investors
     * @param distributionId Distribution ID
     */
    function getDistributionInvestors(uint256 distributionId)
        public
        view
        returns (address[] memory)
    {
        return distributions[distributionId].investors;
    }

    /**
     * @dev Update fee percentages (only owner)
     * @param _platformFeePercentage New platform fee percentage (in basis points)
     * @param _managementFeePercentage New management fee percentage (in basis points)
     */
    function updateFees(uint256 _platformFeePercentage, uint256 _managementFeePercentage)
        public
        onlyOwner
    {
        require(_platformFeePercentage <= 1000, "Platform fee too high"); // Max 10%
        require(_managementFeePercentage <= 2000, "Management fee too high"); // Max 20%

        platformFeePercentage = _platformFeePercentage;
        managementFeePercentage = _managementFeePercentage;

        emit FeesUpdated(_platformFeePercentage, _managementFeePercentage);
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
