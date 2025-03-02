import { useState } from "react";
import { toast } from "react-toastify";
import { useWeb3 } from "../contexts/Web3Context";
import { calculateFileHash, getIpfsGatewayUrl } from "../utils/ipfsService";

const VerifyForm = () => {
  const { verifyAsset, getAssetDetails } = useWeb3();

  const [assetId, setAssetId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAssetIdChange = async (e) => {
    const id = e.target.value;
    setAssetId(id);

    if (id) {
      try {
        setLoading(true);
        const details = await getAssetDetails(id);
        setAssetDetails(details);
      } catch (error) {
        console.error("Error fetching asset details:", error);
        toast.error("Failed to fetch asset details");
        setAssetDetails(null);
      } finally {
        setLoading(false);
      }
    } else {
      setAssetDetails(null);
    }

    // Reset verification when asset ID changes
    setVerificationResult(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);

    // Reset verification when file changes
    setVerificationResult(null);
  };

  const handleVerify = async () => {
    if (!assetId || !file) {
      toast.error("Please select both an asset ID and upload a file to verify");
      return;
    }

    try {
      setLoading(true);

      // Calculate hash of the uploaded file
      const fileHash = await calculateFileHash(file);

      // Verify against blockchain
      const isValid = await verifyAsset(assetId, fileHash);

      setVerificationResult({
        success: isValid,
        message: isValid
          ? "Verification successful! The asset is authentic."
          : "Verification failed! The asset has been modified or is not the original.",
        fileHash,
      });
    } catch (error) {
      console.error("Error verifying asset:", error);
      toast.error("Failed to verify asset: " + error.message);
      setVerificationResult({
        success: false,
        message: "Error during verification process: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Verify Asset Integrity</h2>

      <div className="grid-container">
        <div>
          <div className="form-group">
            <label htmlFor="assetId" className="form-label">
              Asset ID to Verify
            </label>
            <input
              type="text"
              id="assetId"
              value={assetId}
              onChange={handleAssetIdChange}
              placeholder="Enter asset ID"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="verifyFile" className="form-label">
              Upload File to Verify
            </label>
            <div
              className="file-upload"
              onClick={() => document.getElementById("verifyFile").click()}
            >
              <input
                type="file"
                id="verifyFile"
                onChange={handleFileChange}
                className="hidden"
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
                {file ? file.name : "Upload the file you want to verify"}
              </p>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !assetId || !file}
            className={`btn btn-primary w-full ${
              loading || !assetId || !file ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="spinner"></div>
                Verifying...
              </span>
            ) : (
              "Verify Asset"
            )}
          </button>

          {verificationResult && (
            <div
              className={`verification-result ${
                verificationResult.success
                  ? "verification-success"
                  : "verification-failure"
              }`}
            >
              <div className="verification-result-header">
                {verificationResult.success ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="verification-icon"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="verification-icon"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <div>
                  <h3
                    className={`font-medium ${
                      verificationResult.success
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {verificationResult.success
                      ? "Verification Successful"
                      : "Verification Failed"}
                  </h3>
                  <p className="text-sm mt-1">{verificationResult.message}</p>

                  {verificationResult.fileHash && (
                    <div className="mt-2 text-xs">
                      <p className="text-gray-400">File Hash:</p>
                      <code className="hash-text">
                        {verificationResult.fileHash}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="form-group">
            <label className="form-label">Preview</label>
            <div className="preview-container">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="asset-preview-img"
                />
              ) : (
                <p className="text-gray-500">No file selected</p>
              )}
            </div>
          </div>

          {assetDetails && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Registered Asset Details</h3>

              <div className="flex mb-3">
                <div className="w-24 h-24 bg-gray-900 rounded overflow-hidden mr-3">
                  <img
                    src={getIpfsGatewayUrl(assetDetails.ipfsCid)}
                    alt={assetDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{assetDetails.name}</h4>
                  <p className="text-sm line-clamp-2">
                    {assetDetails.description}
                  </p>
                  <p className="text-xs mt-1 text-gray-500">
                    Owner: {assetDetails.owner.substring(0, 6)}...
                    {assetDetails.owner.substring(38)}
                  </p>
                </div>
              </div>

              <div className="text-xs mt-2">
                <p className="font-medium mb-1">Stored Hash:</p>
                <code className="hash-text">{assetDetails.assetHash}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyForm;
