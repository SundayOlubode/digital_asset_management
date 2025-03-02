import { create } from "ipfs-http-client";
import { toast } from "react-toastify";
import { Buffer } from "buffer";

// Configure IPFS client
// Using Infura IPFS gateway - you'll need to replace with your own API keys or use alternatives
const projectId = "YOUR_INFURA_PROJECT_ID"; // Replace with your Infura project ID
const projectSecret = "YOUR_INFURA_PROJECT_SECRET"; // Replace with your Infura secret
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

// Alternative: If you don't want to use Infura, you can use Pinata or NFT.Storage
// This is a simplified implementation

export const uploadToIPFS = async (file) => {
  try {
    // Show loading toast
    const toastId = toast.info("Uploading to IPFS...", { autoClose: false });

    // Upload file to IPFS
    const result = await ipfsClient.add(file, {
      progress: (prog) => console.log(`Upload progress: ${prog}`),
    });

    // Get the IPFS CID
    const ipfsCid = result.path;

    // Update toast
    toast.update(toastId, {
      render: "Successfully uploaded to IPFS!",
      type: toast.TYPE.SUCCESS,
      autoClose: 5000,
    });

    return ipfsCid;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    toast.error("Failed to upload to IPFS. Please try again.");
    throw error;
  }
};

// Calculate the hash of a file for verification
export const calculateFileHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Get IPFS Gateway URL for displaying the image
export const getIpfsGatewayUrl = (ipfsCid) => {
  return `https://ipfs.io/ipfs/${ipfsCid}`;
};
