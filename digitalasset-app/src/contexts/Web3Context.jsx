import { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
// Import ABI directly from JSON file
import contractABI from "./contract-abi.json";

// Create the context
const Web3Context = createContext(null);

// Define the hook with a named function declaration
function useWeb3() {
  return useContext(Web3Context);
}

// Use imported JSON directly
const ABI = contractABI;

// Contract address - your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.CONTRACT_ADDRESS;
console.log("Contract address:", CONTRACT_ADDRESS);

// Define the provider component
function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);

  // Initialize provider from browser window.ethereum
  useEffect(() => {
    const initProvider = async () => {
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          console.log("MetaMask not detected. Please install MetaMask.");
          toast.info(
            "MetaMask not detected. Please install MetaMask to use this application.",
          );
          return;
        }

        console.log("Initializing Web3 provider...");

        // Initialize provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Show currently selected account if already connected
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            console.log("Already connected to account:", accounts[0]);
          }
        } catch (accountError) {
          console.error("Error checking existing accounts:", accountError);
        }

        // Initialize contract
        try {
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(contract);
          console.log("Contract initialized successfully");
        } catch (contractError) {
          console.error("Error initializing contract:", contractError);
          toast.error("Failed to initialize smart contract");
        }

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          console.log("Account changed:", accounts);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            loadUserAssets(accounts[0], contract);
          } else {
            setAccount(null);
            setAssets([]);
            setIsConnected(false);
          }
        });

        // Listen for chain changes
        window.ethereum.on("chainChanged", () => {
          console.log("Network changed, refreshing...");
          window.location.reload();
        });
      } catch (error) {
        console.error("Error initializing Web3:", error);
        setError("Failed to initialize blockchain connection");
        toast.error(
          "Failed to connect to blockchain network: " + error.message,
        );
      }
    };

    initProvider();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    console.log("Connecting wallet...");
    if (!provider) {
      const errorMsg = "Web3 provider not found. Please install MetaMask.";
      console.error(errorMsg);
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    try {
      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Accounts received:", accounts);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        toast.success("Wallet connected successfully!");

        // Make sure contract is initialized
        if (!contract) {
          console.log("Re-initializing contract with connected account");
          const signer = provider.getSigner();
          const newContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer,
          );
          setContract(newContract);

          // Load user's assets after connecting
          await loadUserAssets(accounts[0], newContract);
        } else {
          // Load user's assets after connecting
          await loadUserAssets(accounts[0], contract);
        }
      } else {
        throw new Error("No accounts received from MetaMask");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // Check if user rejected
      if (error.code === 4001) {
        toast.info("Connection request was rejected. Please try again.");
      } else {
        toast.error("Failed to connect wallet: " + error.message);
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load user's assets
  // Load user's assets with better error handling
  const loadUserAssets = async (userAddress, contractInstance) => {
    if (!contractInstance || !userAddress) {
      console.log("Cannot load assets: missing contract or address");
      return;
    }

    setLoading(true);
    try {
      console.log("Loading assets for address:", userAddress);

      // Check if contract has the required functions
      let hasFunction = false;
      try {
        contractInstance.interface.getFunction("getAssetsByOwner");
        hasFunction = true;
      } catch (e) {
        console.warn("Contract doesn't have getAssetsByOwner function:", e);
        setAssets([]);
        return;
      }

      if (!hasFunction) {
        toast.warning(
          "This contract doesn't support asset listing functionality",
        );
        return;
      }

      // Try to get assets
      try {
        const assetIds = await contractInstance.getAssetsByOwner(userAddress);
        console.log("Asset IDs retrieved:", assetIds);

        if (assetIds.length === 0) {
          setAssets([]);
          return;
        }

        // Check if getAssetDetails function exists
        let hasDetailsFunction = false;
        try {
          contractInstance.interface.getFunction("getAssetDetails");
          hasDetailsFunction = true;
        } catch (e) {
          console.warn("Contract doesn't have getAssetDetails function");
          // Create minimal assets from IDs only
          console.log("Message:", e.message);
          const minimalAssets = assetIds.map((id) => ({
            id: id.toString(),
            name: `Asset #${id.toString()}`,
            description: "No details available",
            ipfsCid: "",
            assetHash: "",
            owner: userAddress,
            creationTime: new Date(),
            lastTransferTime: new Date(),
          }));
          setAssets(minimalAssets);
          return;
        }

        // If we have details function, get full details for each asset
        if (hasDetailsFunction) {
          const assetPromises = assetIds.map(async (id) => {
            try {
              console.log("Fetching details for asset ID:", id.toString());
              const details = await contractInstance.getAssetDetails(id);
              return {
                id: details[0].toString(),
                name: details[1] || `Asset #${id.toString()}`,
                description: details[2] || "No description",
                ipfsCid: details[3] || "",
                assetHash: details[4] || "",
                owner: details[5] || userAddress,
                creationTime: details[6]
                  ? new Date(details[6].toNumber() * 1000)
                  : new Date(),
                lastTransferTime: details[7]
                  ? new Date(details[7].toNumber() * 1000)
                  : new Date(),
              };
            } catch (error) {
              console.error(`Error fetching details for asset ${id}:`, error);
              // Return minimal info for assets that fail to load
              return {
                id: id.toString(),
                name: `Asset #${id.toString()}`,
                description: "Failed to load details",
                ipfsCid: "",
                assetHash: "",
                owner: userAddress,
                creationTime: new Date(),
                lastTransferTime: new Date(),
              };
            }
          });

          const userAssets = await Promise.all(assetPromises);
          console.log("User assets loaded:", userAssets);
          setAssets(userAssets);
        }
      } catch (error) {
        console.error("Error getting asset IDs:", error);
        toast.error("Couldn't load your assets: " + extractErrorMessage(error));
        setAssets([]);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
      toast.error(
        "Failed to load your digital assets: " + extractErrorMessage(error),
      );
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Register new asset with enhanced error handling
  const registerAsset = async (name, description, ipfsCid, assetHash) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return null;
    }

    setLoading(true);
    try {
      console.log("Calling registerAsset with params:", {
        name,
        description,
        ipfsCid,
        assetHash,
      });

      // Check contract interface first to avoid mysterious failures
      const isRegisterable = await checkContractFunction("registerAsset");
      if (!isRegisterable) {
        throw new Error(
          "Contract doesn't support registerAsset function or it's not properly configured",
        );
      }

      // Call the contract
      const tx = await contract.registerAsset(
        name,
        description,
        ipfsCid,
        assetHash,
      );
      toast.info(
        "Registering asset... Please wait for transaction confirmation",
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Generate a mock ID for now
      const mockAssetId = `asset-${Date.now().toString().substring(8)}`;

      toast.success(`Asset registration transaction confirmed!`);

      // Don't try to load assets if contract doesn't have the function
      const hasGetAssets = await checkContractFunction("getAssetsByOwner");
      if (hasGetAssets) {
        try {
          await loadUserAssets(account, contract);
        } catch (loadError) {
          console.error("Non-critical error loading assets:", loadError);
        }
      }

      return mockAssetId;
    } catch (error) {
      console.error("Error registering asset:", error);
      toast.error("Failed to register asset: " + extractErrorMessage(error));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if contract supports a function
  const checkContractFunction = async (functionName) => {
    if (!contract) return false;

    try {
      // Try to get the function from the contract
      const fn = contract.interface.getFunction(functionName);
      return !!fn;
    } catch (e) {
      console.error(`Contract doesn't support ${functionName}:`, e);
      return false;
    }
  };

  // Helper to extract readable error messages
  const extractErrorMessage = (error) => {
    if (!error) return "Unknown error";

    // Handle different error types
    if (error.reason) return error.reason;
    if (error.message) {
      // Clean up common ethers.js errors
      const msg = error.message;
      if (msg.includes("call revert exception")) {
        return "Contract function reverted (not enough permission or invalid parameters)";
      }
      if (msg.includes("invalid address")) {
        return "Invalid Ethereum address";
      }
      return msg;
    }

    return "Transaction failed";
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
    error,
    connectWallet,
    registerAsset,
    transferAsset,
    verifyAsset,
    getAssetDetails,
    loadUserAssets,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export { Web3Provider, useWeb3 };
