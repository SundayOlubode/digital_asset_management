import { useState } from "react";
import { toast } from "react-toastify";
import { useWeb3 } from "../contexts/Web3Context";
import { uploadToIPFS, calculateFileHash } from "../utils/ipfsService";

const AssetForm = () => {
  const { registerAsset, isConnected, loading } = useWeb3();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image and not too large
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10 MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setFormData({ ...formData, file });

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const { name, description, file } = formData;

    if (!name || !description || !file) {
      toast.error("Please fill in all fields and upload an image");
      return;
    }

    try {
      setUploading(true);

      // Upload to IPFS
      const ipfsCid = await uploadToIPFS(file);

      // Calculate hash for verification
      const assetHash = await calculateFileHash(file);

      // Register asset on blockchain
      const assetId = await registerAsset(
        name,
        description,
        ipfsCid,
        assetHash,
      );

      if (assetId) {
        toast.success(`Asset registered successfully with ID: ${assetId}`);
        // Reset form
        setFormData({ name: "", description: "", file: null });
        setFilePreview(null);
      }
    } catch (error) {
      console.error("Error registering asset:", error);
      toast.error("Failed to register asset: " + error.message);
    } finally {
      setUploading(false);
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="file" className="form-label">
                Upload Asset
              </label>
              <div
                className="file-upload"
                onClick={() => document.getElementById("file").click()}
              >
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="file-upload-icon"
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
                <p className="mt-2 text-sm">
                  {formData.file
                    ? formData.file.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs mt-1 text-gray-500">
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
                <p className="text-gray-500">No image selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || uploading || !isConnected}
            className={`btn btn-primary w-full ${
              loading || uploading || !isConnected ? "opacity-50" : ""
            }`}
          >
            {uploading || loading ? (
              <span className="flex items-center justify-center">
                <div className="spinner"></div>
                {uploading ? "Uploading..." : "Registering..."}
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
