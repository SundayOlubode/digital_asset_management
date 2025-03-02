import { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// ABI from your compiled contract
const ABI = [
  // This should be the ABI from your compiled DigitalAssetManagement contract
  // For now, I'll include a few key function signatures as placeholders
  "function registerAsset(string memory _name, string memory _description, string memory _ipfsCid, string memory _assetHash) public returns (uint256)",
  "function transferAsset(uint256 _assetId, address _newOwner) public returns (bool)",
  "function getAssetDetails(uint256 _assetId) public view returns (uint256, string memory, string memory, string memory, string memory, address, uint256, uint256)",
  "function getAssetsByOwner(address _owner) public view returns (uint256[] memory)",
  "function verifyAssetIntegrity(uint256 _assetId, string memory _assetHash) public view returns (bool)",
];

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace this

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);

  // Initialize provider from browser window.ethereum
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider.getSigner(),
          );
          setContract(contract);

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              loadUserAssets(accounts[0], contract);
            } else {
              setAccount(null);
              setAssets([]);
              setIsConnected(false);
            }
          });
        } catch (error) {
          console.error("Error initializing Web3:", error);
          toast.error("Failed to connect to blockchain network");
        }
      } else {
        toast.error("Please install MetaMask to use this application");
      }
    };

    initProvider();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!provider) {
      toast.error("Web3 provider not found. Please install MetaMask.");
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        toast.success("Wallet connected successfully!");

        // Load user's assets after connecting
        await loadUserAssets(accounts[0], contract);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Load user's assets
  const loadUserAssets = async (userAddress, contract) => {
    if (!contract || !userAddress) return;

    setLoading(true);
    try {
      const assetIds = await contract.getAssetsByOwner(userAddress);

      const assetPromises = assetIds.map(async (id) => {
        const details = await contract.getAssetDetails(id);
        return {
          id: details[0].toString(),
          name: details[1],
          description: details[2],
          ipfsCid: details[3],
          assetHash: details[4],
          owner: details[5],
          creationTime: new Date(details[6].toNumber() * 1000),
          lastTransferTime: new Date(details[7].toNumber() * 1000),
        };
      });

      const userAssets = await Promise.all(assetPromises);
      setAssets(userAssets);
    } catch (error) {
      console.error("Error loading assets:", error);
      toast.error("Failed to load your digital assets");
    } finally {
      setLoading(false);
    }
  };

  // Register new asset
  const registerAsset = async (name, description, ipfsCid, assetHash) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return null;
    }

    setLoading(true);
    try {
      const tx = await contract.registerAsset(
        name,
        description,
        ipfsCid,
        assetHash,
      );
      toast.info(
        "Registering asset... Please wait for transaction confirmation",
      );

      const receipt = await tx.wait();

      // Find the AssetRegistered event and get the assetId
      const event = receipt.events.find(
        (event) => event.event === "AssetRegistered",
      );
      const assetId = event.args.assetId.toString();

      toast.success("Asset registered successfully!");

      // Reload user assets
      await loadUserAssets(account, contract);

      return assetId;
    } catch (error) {
      console.error("Error registering asset:", error);
      toast.error("Failed to register asset: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Transfer asset ownership
  const transferAsset = async (assetId, newOwner) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return false;
    }

    setLoading(true);
    try {
      const tx = await contract.transferAsset(assetId, newOwner);
      toast.info(
        "Transferring asset... Please wait for transaction confirmation",
      );

      await tx.wait();
      toast.success("Asset transferred successfully!");

      // Reload user assets
      await loadUserAssets(account, contract);

      return true;
    } catch (error) {
      console.error("Error transferring asset:", error);
      toast.error("Failed to transfer asset: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify asset integrity
  const verifyAsset = async (assetId, assetHash) => {
    if (!contract) {
      toast.error("Web3 not initialized correctly");
      return false;
    }

    try {
      const isValid = await contract.verifyAssetIntegrity(assetId, assetHash);
      return isValid;
    } catch (error) {
      console.error("Error verifying asset:", error);
      toast.error("Failed to verify asset: " + error.message);
      return false;
    }
  };

  // Get asset details
  const getAssetDetails = async (assetId) => {
    if (!contract) {
      toast.error("Web3 not initialized correctly");
      return null;
    }

    try {
      const details = await contract.getAssetDetails(assetId);
      return {
        id: details[0].toString(),
        name: details[1],
        description: details[2],
        ipfsCid: details[3],
        assetHash: details[4],
        owner: details[5],
        creationTime: new Date(details[6].toNumber() * 1000),
        lastTransferTime: new Date(details[7].toNumber() * 1000),
      };
    } catch (error) {
      console.error("Error getting asset details:", error);
      toast.error("Failed to get asset details");
      return null;
    }
  };

  const value = {
    account,
    isConnected,
    loading,
    assets,
    connectWallet,
    registerAsset,
    transferAsset,
    verifyAsset,
    getAssetDetails,
    loadUserAssets,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
