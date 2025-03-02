import { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { uploadToIPFS, calculateFileHash } from "../utils/ipfsService";
import simpleToast from "../utils/simpleToast";

const AssetForm = () => {
  const { registerAsset, isConnected, loading } = useWeb3();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(null); // Track which stage of the process we're in
  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Check if file is an image and not too large
      if (!file.type.startsWith("image/")) {
        simpleToast.error("Please upload an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10 MB limit
        simpleToast.error("File size must be less than 10MB");
        return;
      }

      console.log("File selected:", file.name, file.type, file.size);
      setFormData({ ...formData, file });

      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        simpleToast.error("Error reading file: " + e.target.error);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error in file selection:", err);
      simpleToast.error("Error selecting file: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log("Form submission started");
    setIsRegistering(true);

    if (!isConnected) {
      const errMsg = "Please connect your wallet first";
      setError(errMsg);
      simpleToast.error(errMsg);
      setIsRegistering(false);
      return;
    }

    const { name, description, file } = formData;

    if (!name || !description || !file) {
      const errMsg = "Please fill in all fields and upload an image";
      setError(errMsg);
      simpleToast.error(errMsg);
      setIsRegistering(false);
      return;
    }

    try {
      setUploading(true);

      // Step 1: Calculate file hash for verification
      setStage("hashing");
      console.log("Calculating file hash...");
      let assetHash;
      try {
        assetHash = await calculateFileHash(file);
        console.log("File hash calculated:", assetHash);
      } catch (hashError) {
        console.error("Hash calculation error:", hashError);
        throw new Error("Failed to calculate file hash: " + hashError.message);
      }

      // Step 2: Upload to IPFS
      setStage("ipfs");
      console.log("Uploading to IPFS...");
      let ipfsCid;
      try {
        ipfsCid = await uploadToIPFS(file);
        console.log("File uploaded to IPFS with CID:", ipfsCid);
      } catch (ipfsError) {
        console.error("IPFS upload error:", ipfsError);
        throw new Error("Failed to upload to IPFS: " + ipfsError.message);
      }

      // Step 3: Register asset on blockchain
      setStage("blockchain");
      console.log("Registering asset on blockchain...");
      try {
        const assetId = await registerAsset(
          name,
          description,
          ipfsCid,
          assetHash,
        );
        console.log("Asset registered with ID:", assetId);

        if (assetId) {
          simpleToast.success(
            `Asset registered successfully with ID: ${assetId}`,
          );
          // Reset form
          setFormData({ name: "", description: "", file: null });
          setFilePreview(null);
        } else {
          throw new Error("Asset registration returned no ID");
        }
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        throw new Error(
          "Failed to register on blockchain: " + contractError.message,
        );
      }
    } catch (error) {
      console.error("Error registering asset:", error);
      setError(error.message || "Unknown error occurred");
      simpleToast.error("Failed to register asset: " + error.message);
    } finally {
      setUploading(false);
      setStage(null);
      setIsRegistering(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Register New Digital Asset</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid-container">
          <div>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Asset Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Cosmic Horizon Artwork"
                className="form-input"
                required
                disabled={uploading || isRegistering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your digital asset..."
                className="form-textarea"
                required
                disabled={uploading || isRegistering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="file" className="form-label">
                Upload Asset
              </label>
              <div
                className="file-upload"
                onClick={() =>
                  !uploading &&
                  !isRegistering &&
                  document.getElementById("file").click()
                }
                style={{
                  opacity: uploading || isRegistering ? 0.7 : 1,
                  cursor:
                    uploading || isRegistering ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={uploading || isRegistering}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p style={{ marginTop: "8px", fontSize: "0.875rem" }}>
                  {formData.file
                    ? formData.file.name
                    : "Click to upload or drag and drop"}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "4px",
                    color: "#6b7280",
                  }}
                >
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="form-label">Preview</label>
            <div className="preview-container">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="asset-preview-img"
                />
              ) : (
                <p style={{ color: "#6b7280" }}>No image selected</p>
              )}
            </div>

            {/* Processing Status */}
            {stage && (
              <div
                style={{
                  marginTop: "16px",
                  background: "#1e293b",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <p>
                  Current process: <strong>{stage}</strong>
                </p>
                <ul style={{ marginTop: "8px", fontSize: "0.875rem" }}>
                  <li
                    style={{
                      color: stage === "hashing" ? "#4ade80" : "#6b7280",
                    }}
                  >
                    {stage === "hashing"
                      ? "⚡ "
                      : stage === "ipfs" || stage === "blockchain"
                      ? "✓ "
                      : "⚪ "}
                    Calculating file hash
                  </li>
                  <li
                    style={{
                      color:
                        stage === "ipfs"
                          ? "#4ade80"
                          : stage === "blockchain"
                          ? "#d1d5db"
                          : "#6b7280",
                    }}
                  >
                    {stage === "ipfs"
                      ? "⚡ "
                      : stage === "blockchain"
                      ? "✓ "
                      : "⚪ "}
                    Uploading to IPFS
                  </li>
                  <li
                    style={{
                      color: stage === "blockchain" ? "#4ade80" : "#6b7280",
                    }}
                  >
                    {stage === "blockchain" ? "⚡ " : "⚪ "}
                    Registering on blockchain
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div
            style={{
              marginTop: "16px",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid #7f1d1d",
              padding: "12px",
              borderRadius: "8px",
              color: "#ef4444",
            }}
          >
            <p>
              <strong>Error:</strong> {error}
            </p>
            <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>
              Please check browser console for more details.
            </p>
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          <button
            type="submit"
            disabled={loading || uploading || !isConnected || isRegistering}
            className="btn btn-primary w-full"
            style={{
              opacity:
                loading || uploading || !isConnected || isRegistering ? 0.5 : 1,
              width: "100%",
              cursor:
                loading || uploading || !isConnected || isRegistering
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {uploading || loading || isRegistering ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="spinner" style={{ marginRight: "12px" }}></div>
                {uploading
                  ? `${
                      stage
                        ? stage.charAt(0).toUpperCase() + stage.slice(1)
                        : "Uploading"
                    }...`
                  : "Registering..."}
              </span>
            ) : (
              "Register Digital Asset"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
