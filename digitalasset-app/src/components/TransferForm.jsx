import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useWeb3 } from "../contexts/Web3Context";
import { getIpfsGatewayUrl } from "../utils/ipfsService";

const TransferForm = () => {
  const { transferAsset, getAssetDetails, assets, isConnected, loading } =
    useWeb3();

  const [formData, setFormData] = useState({
    assetId: "",
    newOwner: "",
  });

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // When asset ID changes, fetch asset details
    if (name === "assetId" && value) {
      fetchAssetDetails(value);
    }
  };

  const fetchAssetDetails = async (assetId) => {
    try {
      setAssetLoading(true);
      const assetDetails = await getAssetDetails(assetId);
      setSelectedAsset(assetDetails);
    } catch (error) {
      console.error("Error fetching asset details:", error);
      toast.error("Failed to fetch asset details");
      setSelectedAsset(null);
    } finally {
      setAssetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const { assetId, newOwner } = formData;

    if (!assetId || !newOwner) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    try {
      // Perform transfer
      const success = await transferAsset(assetId, newOwner);

      if (success) {
        toast.success("Asset transferred successfully!");
        // Reset form
        setFormData({ assetId: "", newOwner: "" });
        setSelectedAsset(null);
      }
    } catch (error) {
      console.error("Error transferring asset:", error);
      toast.error("Failed to transfer asset: " + error.message);
    }
  };

  // Initialize with URL parameters if any
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const assetIdParam = urlParams.get("assetId");

    // Then check localStorage for a selected asset
    const selectedAssetId = localStorage.getItem("selectedAssetId");

    // URL param takes precedence, otherwise use localStorage
    const assetId = assetIdParam || selectedAssetId;

    if (assetId) {
      setFormData((prevData) => ({ ...prevData, assetId }));
      fetchAssetDetails(assetId);
      // Clear localStorage after reading
      if (selectedAssetId) {
        localStorage.removeItem("selectedAssetId");
      }
    }
  }, []);

  return (
    <div className="card">
      <h2 className="section-title">Transfer Asset Ownership</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid-container">
          <div>
            <div className="form-group">
              <label htmlFor="assetId" className="form-label">
                Asset ID
              </label>
              <select
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select an asset to transfer</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    ID: {asset.id} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="newOwner" className="form-label">
                New Owner Address
              </label>
              <input
                type="text"
                id="newOwner"
                name="newOwner"
                value={formData.newOwner}
                onChange={handleInputChange}
                placeholder="0x..."
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Ethereum address of the new owner
              </p>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={
                  loading || assetLoading || !isConnected || !selectedAsset
                }
                className={`btn btn-primary w-full ${
                  loading || assetLoading || !isConnected || !selectedAsset
                    ? "opacity-50"
                    : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner"></div>
                    Transferring...
                  </span>
                ) : (
                  "Transfer Ownership"
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="form-label">Selected Asset</label>
            <div className="preview-container">
              {assetLoading ? (
                <div className="spinner spinner-lg"></div>
              ) : selectedAsset ? (
                <div className="w-full h-full relative">
                  <img
                    src={getIpfsGatewayUrl(selectedAsset.ipfsCid)}
                    alt={selectedAsset.name}
                    className="asset-preview-img"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
                    <h3 className="font-medium">{selectedAsset.name}</h3>
                    <p className="text-sm truncate">
                      {selectedAsset.description}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No asset selected</p>
              )}
            </div>

            {selectedAsset && (
              <div className="mt-4 bg-gray-800 p-3 rounded-lg text-sm">
                <p className="text-gray-400">
                  <span className="text-purple-400 font-medium">Warning:</span>{" "}
                  Transferring will permanently move this asset to the new
                  owner's address. This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;
