// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PropertyNFT
 * @dev NFT contract for tokenizing real estate properties on Hedera
 * Each NFT represents a unique real estate property with metadata
 */
contract PropertyNFT is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Property information structure
    struct PropertyInfo {
        string name;
        string description;
        string propertyType; // residential, commercial, industrial, mixed-use
        uint256 totalValue; // Property value in wei
        uint256 totalTokens; // Total fractional tokens for this property
        uint256 availableTokens; // Available tokens for purchase
        uint256 tokenPrice; // Price per fractional token in wei
        address propertyOwner; // Original property owner
        bool isActive; // Whether property is active for investment
        uint256 createdAt;
        string metadataURI; // IPFS URI for additional metadata
    }

    // Mapping from token ID to property information
    mapping(uint256 => PropertyInfo) public properties;

    // Mapping from property owner to their property token IDs
    mapping(address => uint256[]) public ownerProperties;

    // Mapping to track KYC verified addresses
    mapping(address => bool) public kycVerified;

    // Events
    event PropertyMinted(
        uint256 indexed tokenId,
        address indexed propertyOwner,
        string name,
        uint256 totalValue,
        uint256 totalTokens
    );

    event PropertyUpdated(
        uint256 indexed tokenId,
        uint256 totalValue,
        uint256 availableTokens,
        uint256 tokenPrice
    );

    event PropertyStatusChanged(uint256 indexed tokenId, bool isActive);

    event KYCStatusUpdated(address indexed user, bool verified);

    modifier onlyKYCVerified() {
        require(kycVerified[msg.sender], "KYC verification required");
        _;
    }

    modifier onlyPropertyOwner(uint256 tokenId) {
        require(
            properties[tokenId].propertyOwner == msg.sender,
            "Not the property owner"
        );
        _;
    }

    constructor() ERC721("Hedera Real Estate NFT", "HRENFT") {}

    /**
     * @dev Mint a new property NFT
     * @param to Address to mint the NFT to (property owner)
     * @param name Property name
     * @param description Property description
     * @param propertyType Type of property
     * @param totalValue Total property value
     * @param totalTokens Total fractional tokens
     * @param tokenPrice Price per fractional token
     * @param metadataURI IPFS URI for metadata
     */
    function mintProperty(
        address to,
        string memory name,
        string memory description,
        string memory propertyType,
        uint256 totalValue,
        uint256 totalTokens,
        uint256 tokenPrice,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(kycVerified[to], "Recipient must be KYC verified");
        require(totalValue > 0, "Total value must be greater than 0");
        require(totalTokens > 0, "Total tokens must be greater than 0");
        require(tokenPrice > 0, "Token price must be greater than 0");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        properties[tokenId] = PropertyInfo({
            name: name,
            description: description,
            propertyType: propertyType,
            totalValue: totalValue,
            totalTokens: totalTokens,
            availableTokens: totalTokens,
            tokenPrice: tokenPrice,
            propertyOwner: to,
            isActive: true,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });

        ownerProperties[to].push(tokenId);

        emit PropertyMinted(tokenId, to, name, totalValue, totalTokens);

        return tokenId;
    }

    /**
     * @dev Update property information (only property owner)
     */
    function updateProperty(
        uint256 tokenId,
        uint256 newTotalValue,
        uint256 newTokenPrice
    ) public onlyPropertyOwner(tokenId) whenNotPaused {
        require(_exists(tokenId), "Property does not exist");
        require(newTotalValue > 0, "Total value must be greater than 0");
        require(newTokenPrice > 0, "Token price must be greater than 0");

        properties[tokenId].totalValue = newTotalValue;
        properties[tokenId].tokenPrice = newTokenPrice;

        emit PropertyUpdated(
            tokenId,
            newTotalValue,
            properties[tokenId].availableTokens,
            newTokenPrice
        );
    }

    /**
     * @dev Update available tokens (called by fractional token contract)
     */
    function updateAvailableTokens(uint256 tokenId, uint256 newAvailableTokens)
        public
        onlyOwner
    {
        require(_exists(tokenId), "Property does not exist");
        properties[tokenId].availableTokens = newAvailableTokens;

        emit PropertyUpdated(
            tokenId,
            properties[tokenId].totalValue,
            newAvailableTokens,
            properties[tokenId].tokenPrice
        );
    }

    /**
     * @dev Set property active/inactive status
     */
    function setPropertyStatus(uint256 tokenId, bool isActive)
        public
        onlyPropertyOwner(tokenId)
    {
        require(_exists(tokenId), "Property does not exist");
        properties[tokenId].isActive = isActive;

        emit PropertyStatusChanged(tokenId, isActive);
    }

    /**
     * @dev Set KYC verification status for an address
     */
    function setKYCStatus(address user, bool verified) public onlyOwner {
        kycVerified[user] = verified;
        emit KYCStatusUpdated(user, verified);
    }

    /**
     * @dev Batch set KYC verification status
     */
    function batchSetKYCStatus(address[] memory users, bool verified)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < users.length; i++) {
            kycVerified[users[i]] = verified;
            emit KYCStatusUpdated(users[i], verified);
        }
    }

    /**
     * @dev Get property information
     */
    function getProperty(uint256 tokenId)
        public
        view
        returns (PropertyInfo memory)
    {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId];
    }

    /**
     * @dev Get properties owned by an address
     */
    function getPropertiesByOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return ownerProperties[owner];
    }

    /**
     * @dev Get total number of properties
     */
    function getTotalProperties() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override transfer functions to include KYC check
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyKYCVerified {
        require(kycVerified[to], "Recipient must be KYC verified");
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyKYCVerified {
        require(kycVerified[to], "Recipient must be KYC verified");
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override onlyKYCVerified {
        require(kycVerified[to], "Recipient must be KYC verified");
        super.safeTransferFrom(from, to, tokenId, data);
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

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
