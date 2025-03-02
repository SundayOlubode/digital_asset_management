import { useWeb3 } from "../contexts/Web3Context";

const ConnectWallet = () => {
  const { account, isConnected, loading, connectWallet } = useWeb3();

  // Format address to be more readable
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  // Safe connect function with error handling
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error in connect button handler:", error);
      // The error should already be handled in the context, but this prevents UI crashes
    }
  };

  return (
    <div className="wallet-card card">
      <div className="wallet-info">
        <h2 className="text-xl font-bold mb-2">Blockchain Connection</h2>
        {isConnected ? (
          <div className="wallet-status">
            <div className="status-indicator status-connected"></div>
            <p className="text-green-400">
              Connected as: {formatAddress(account)}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">Not connected to the blockchain</p>
        )}
      </div>

      <button
        onClick={handleConnect}
        disabled={loading || isConnected}
        className={`btn btn-primary ${
          loading || isConnected ? "opacity-50" : ""
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="spinner"></div>
            Connecting...
          </span>
        ) : isConnected ? (
          "Connected"
        ) : (
          <span className="btn-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>
    </div>
  );
};

export default ConnectWallet;
