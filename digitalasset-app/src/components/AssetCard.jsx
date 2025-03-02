import { useState } from "react";
import { getIpfsGatewayUrl } from "../utils/ipfsService";

const AssetCard = ({ asset }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ipfsUrl = getIpfsGatewayUrl(asset.ipfsCid);

  return (
    <div className="asset-card">
      <div className="asset-img-container">
        {!isImageLoaded && (
          <div className="flex items-center justify-center absolute inset-0">
            <div className="spinner"></div>
          </div>
        )}
        <img
          src={ipfsUrl}
          alt={asset.name}
          className={`asset-img ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>

      <div className="asset-content">
        <div className="asset-header">
          <h3 className="asset-title truncate" title={asset.name}>
            {asset.name}
          </h3>
          <span className="asset-id">ID: {asset.id}</span>
        </div>

        <p className="asset-description line-clamp-2" title={asset.description}>
          {asset.description}
        </p>

        <div className="asset-meta">
          <div className="flex justify-between">
            <span>Created: {formatDate(asset.creationTime)}</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="detail-toggle"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {showDetails && (
            <div className="asset-details">
              <div className="detail-row">
                <span className="detail-label">Asset Hash:</span>
                <span className="detail-value" title={asset.assetHash}>
                  {asset.assetHash.substring(0, 16)}...
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">IPFS CID:</span>
                <span className="detail-value" title={asset.ipfsCid}>
                  {asset.ipfsCid.substring(0, 16)}...
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Transfer:</span>
                <span className="detail-value">
                  {formatDate(asset.lastTransferTime)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="asset-actions">
          <button
            onClick={() => window.open(ipfsUrl, "_blank")}
            className="asset-action-btn btn btn-secondary"
          >
            View Asset
          </button>
          <button
            data-id={asset.id}
            className="asset-action-btn btn btn-primary"
            onClick={() => {
              // Find the transfer tab button and click it
              const transferTab = document.querySelector(
                'button[data-tab="transfer"]',
              );
              if (transferTab) {
                transferTab.click();
                // Set the asset ID in the transfer form
                setTimeout(() => {
                  const assetIdInput = document.getElementById("assetId");
                  if (assetIdInput) {
                    assetIdInput.value = asset.id;
                  }
                }, 100);
              }
            }}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
