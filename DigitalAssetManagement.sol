// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Digital Asset Management
 * @dev Contract for registering, transferring, and verifying digital assets on the Ethereum blockchain
 */
contract DigitalAssetManagement {
		// State variables
		address public owner;
		uint256 private assetCount;
		
		// Asset struct to store metadata
		struct DigitalAsset {
				uint256 id;
				string name;
				string description;
				string assetHash;
				address currentOwner;
				uint256 creationTime;
				uint256 lastTransferTime;
				bool exists;
		}
		
		// Mappings for asset management
		mapping(uint256 => DigitalAsset) private assets;
		mapping(address => uint256[]) private ownerAssets;
		mapping(string => bool) private registeredHashes;
		
		// Events for auditing and monitoring
		event AssetRegistered(uint256 indexed assetId, address indexed owner, string assetHash, uint256 timestamp);
		event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 timestamp);
		event AssetUpdated(uint256 indexed assetId, address indexed owner, uint256 timestamp);
		event SuspiciousActivity(uint256 indexed assetId, string activityType, uint256 timestamp);
		
		// Modifiers
		modifier onlyOwner() {
				require(msg.sender == owner, "Only contract owner can call this function");
				_;
		}
		
		modifier onlyAssetOwner(uint256 _assetId) {
				require(assets[_assetId].exists, "Asset does not exist");
				require(assets[_assetId].currentOwner == msg.sender, "Only asset owner can call this function");
				_;
		}
		
		modifier assetExists(uint256 _assetId) {
				require(assets[_assetId].exists, "Asset does not exist");
				_;
		}
		
		// Constructor
		constructor() {
				owner = msg.sender;
				assetCount = 0;
		}
		
		/**
		 * @dev Registers a new digital asset
		 * @param _name Asset name
		 * @param _description Asset description
		 * @param _assetHash Cryptographic hash of the asset
		 * @return assetId of the newly registered asset
		 */
		function registerAsset(
				string memory _name,
				string memory _description,
				string memory _assetHash
		) public returns (uint256) {
				// Validate input
				require(bytes(_name).length > 0, "Name cannot be empty");
				require(bytes(_assetHash).length > 0, "Asset hash cannot be empty");
				require(!registeredHashes[_assetHash], "Asset with this hash already exists");
				
				// Create new asset
				uint256 newAssetId = assetCount++;
				
				DigitalAsset memory newAsset = DigitalAsset({
						id: newAssetId,
						name: _name,
						description: _description,
						assetHash: _assetHash,
						currentOwner: msg.sender,
						creationTime: block.timestamp,
						lastTransferTime: block.timestamp,
						exists: true
				});
				
				// Store asset data
				assets[newAssetId] = newAsset;
				ownerAssets[msg.sender].push(newAssetId);
				registeredHashes[_assetHash] = true;
				
				// Emit event
				emit AssetRegistered(newAssetId, msg.sender, _assetHash, block.timestamp);
				
				return newAssetId;
		}
		
		/**
		 * @dev Transfers asset ownership to a new address
		 * @param _assetId ID of the asset to transfer
		 * @param _newOwner Address of the new owner
		 * @return success of the transfer operation
		 */
		function transferAsset(uint256 _assetId, address _newOwner) public onlyAssetOwner(_assetId) returns (bool) {
				// Validate input
				require(_newOwner != address(0), "New owner cannot be zero address");
				require(_newOwner != msg.sender, "New owner cannot be the current owner");
				
				// Update asset ownership
				address previousOwner = assets[_assetId].currentOwner;
				assets[_assetId].currentOwner = _newOwner;
				assets[_assetId].lastTransferTime = block.timestamp;
				
				// Update ownership records
				_removeAssetFromOwner(previousOwner, _assetId);
				ownerAssets[_newOwner].push(_assetId);
				
				// Emit event
				emit AssetTransferred(_assetId, previousOwner, _newOwner, block.timestamp);
				
				return true;
		}
		
		/**
		 * @dev Updates asset metadata
		 * @param _assetId ID of the asset to update
		 * @param _name New asset name
		 * @param _description New asset description
		 * @return success of the update operation
		 */
		function updateAssetMetadata(
				uint256 _assetId,
				string memory _name,
				string memory _description
		) public onlyAssetOwner(_assetId) returns (bool) {
				// Validate input
				require(bytes(_name).length > 0, "Name cannot be empty");
				
				// Update metadata
				assets[_assetId].name = _name;
				assets[_assetId].description = _description;
				
				// Emit event
				emit AssetUpdated(_assetId, msg.sender, block.timestamp);
				
				return true;
		}
		
		/**
		 * @dev Verifies the integrity of an asset by comparing its hash
		 * @param _assetId ID of the asset to verify
		 * @param _assetHash Hash to verify against the stored hash
		 * @return isValid Whether the asset hash matches
		 */
		function verifyAssetIntegrity(uint256 _assetId, string memory _assetHash) public view assetExists(_assetId) returns (bool) {
				return keccak256(abi.encodePacked(assets[_assetId].assetHash)) == keccak256(abi.encodePacked(_assetHash));
		}
		
		/**
		 * @dev Reports suspicious activity related to an asset
		 * @param _assetId ID of the asset
		 * @param _activityType Type of suspicious activity
		 */
		function reportSuspiciousActivity(uint256 _assetId, string memory _activityType) public assetExists(_assetId) {
				emit SuspiciousActivity(_assetId, _activityType, block.timestamp);
		}
		
		/**
     * @dev Gets details of a specific asset
     * @param _assetId ID of the asset
     * @return id Asset identifier
     * @return name Asset name
     * @return description Asset description
     * @return assetHash Cryptographic hash of the asset
     * @return currentOwner Address of the current owner
     * @return creationTime Timestamp when the asset was created
     * @return lastTransferTime Timestamp of the last ownership transfer
     */
		function getAssetDetails(uint256 _assetId) public view assetExists(_assetId) returns (
				uint256 id,
				string memory name,
				string memory description,
				string memory assetHash,
				address currentOwner,
				uint256 creationTime,
				uint256 lastTransferTime
		) {
				DigitalAsset storage asset = assets[_assetId];
				return (
						asset.id,
						asset.name,
						asset.description,
						asset.assetHash,
						asset.currentOwner,
						asset.creationTime,
						asset.lastTransferTime
				);
		}
		
		/**
		 * @dev Gets all assets owned by a specific address
		 * @param _owner Address of the owner
		 * @return array of asset IDs owned by the address
		 */
		function getAssetsByOwner(address _owner) public view returns (uint256[] memory) {
				return ownerAssets[_owner];
		}
		
		/**
		 * @dev Gets total number of registered assets
		 * @return total assets count
		 */
		function getTotalAssets() public view returns (uint256) {
				return assetCount;
		}
		
		/**
		 * @dev Checks if a hash is already registered
		 * @param _assetHash Hash to check
		 * @return isRegistered Whether the hash is already registered
		 */
		function isHashRegistered(string memory _assetHash) public view returns (bool) {
				return registeredHashes[_assetHash];
		}
		
		/**
		 * @dev Helper function to remove an asset from an owner's list
		 * @param _owner Address of the owner
		 * @param _assetId ID of the asset to remove
		 */
		function _removeAssetFromOwner(address _owner, uint256 _assetId) private {
				uint256[] storage ownerAssetList = ownerAssets[_owner];
				uint256 length = ownerAssetList.length;
				uint256 index = length;
				
				for (uint256 i = 0; i < length; i++) {
						if (ownerAssetList[i] == _assetId) {
								index = i;
								break;
						}
				}
				
				if (index < length) {
						// Move the last element to the index being removed
						ownerAssetList[index] = ownerAssetList[length - 1];
						// Remove the last element
						ownerAssetList.pop();
				}
		}
}