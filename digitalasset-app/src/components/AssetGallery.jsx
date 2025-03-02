import { useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import AssetCard from "./AssetCard";

const AssetGallery = () => {
  const { assets, loading, isConnected, account, loadUserAssets, contract } =
    useWeb3();

  useEffect(() => {
    // Reload assets when component mounts and wallet is connected
    if (isConnected && account && contract) {
      loadUserAssets(account, contract);
    }
  }, [isConnected, account, contract, loadUserAssets]);

  if (!isConnected) {
    return (
      <div className="card">
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="empty-state-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-medium">Wallet Not Connected</h3>
          <p className="mt-2 text-gray-500">
            Please connect your wallet to view your digital assets.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading-indicator">
          <div className="spinner spinner-lg"></div>
          <h3 className="mt-4 text-xl font-medium">Loading Your Assets</h3>
          <p className="mt-2 text-gray-500">
            Please wait while we fetch your digital assets...
          </p>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="empty-state-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-xl font-medium">No Assets Found</h3>
          <p className="mt-2 text-gray-500">
            You don't have any digital assets registered yet.
          </p>
          <button
            onClick={() =>
              document.querySelector('button[data-tab="register"]').click()
            }
            className="btn btn-outline mt-4"
          >
            Register Your First Asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">My Digital Assets</h2>
        <span className="badge badge-purple">
          {assets.length} {assets.length === 1 ? "Asset" : "Assets"}
        </span>
      </div>

      <div className="asset-gallery grid-container lg-grid-cols-3">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};

export default AssetGallery;
