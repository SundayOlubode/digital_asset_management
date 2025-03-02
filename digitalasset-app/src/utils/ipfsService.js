import axios from "axios";
import simpleToast from "./simpleToast";

// Pinata API keys from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

// Upload file to IPFS via Pinata
export const uploadToIPFS = async (file) => {
  try {
    console.log("Starting Pinata upload for file:", file.name);

    // Show loading toast
    simpleToast.info("Uploading to IPFS...");

    // Check if we have keys
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.warn("Missing Pinata API keys. Check your .env file.");

      // Fall back to mock mode automatically if keys are missing
      console.log("Falling back to mock upload");
      const mockCid = await mockUploadToIPFS(file);

      simpleToast.warning("Using mock IPFS (API keys missing)");

      return mockCid;
    }

    // Create FormData for Pinata API
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        description: "Digital Asset",
        app: "Digital Asset Manager",
        timestamp: Date.now().toString(),
      },
    });
    formData.append("pinataMetadata", metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    // Upload to Pinata
    console.log("Uploading to Pinata...");
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity, // Required for larger files
        headers: {
          "Content-Type": `multipart/form-data;`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      },
    );

    console.log("Pinata upload successful:", response.data);
    const ipfsCid = response.data.IpfsHash;

    // Show success toast
    simpleToast.success("Successfully uploaded to IPFS!");

    return ipfsCid;
  } catch (error) {
    console.error("Error in IPFS upload process:", error);

    let errorMessage = "Failed to upload to IPFS";

    // Extract the most helpful error message
    if (error.response) {
      // Pinata API error
      errorMessage =
        error.response.data?.error || error.response.statusText || errorMessage;
      console.error("Pinata API error:", error.response.data);
    } else if (error.request) {
      // Network error
      errorMessage = "Network error - check your internet connection";
      console.error("Network error:", error.request);
    } else {
      // Other errors
      errorMessage = error.message || errorMessage;
    }

    simpleToast.error(`IPFS upload failed: ${errorMessage}`);

    // Try mock upload as fallback
    console.log("Attempting mock upload as fallback");
    try {
      const mockCid = await mockUploadToIPFS(file);
      simpleToast.info("Using mock IPFS due to upload failure");
      return mockCid;
    } catch (mockError) {
      console.error("Mock upload failed too:", mockError);
      throw error; // Throw original error if mock fails too
    }
  }
};

// Mock upload for testing or fallback
const mockUploadToIPFS = async (file) => {
  console.log("Using mock IPFS upload");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `mock-ipfs-${file.name.replace(/[^a-z0-9]/gi, "")}-${Date.now()}`;
};

// Calculate the hash of a file for verification
export const calculateFileHash = async (file) => {
  try {
    console.log("Calculating hash for file:", file.name);
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
          console.log(
            "Hash calculation complete:",
            hashHex.substring(0, 10) + "...",
          );
          resolve(hashHex);
        } catch (error) {
          console.error("Error in hash calculation:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error("Error preparing file hash calculation:", error);
    throw new Error(`Failed to calculate file hash: ${error.message}`);
  }
};

// Get IPFS Gateway URL for displaying the image
export const getIpfsGatewayUrl = (ipfsCid) => {
  // For mock CIDs, return a placeholder image
  if (ipfsCid && ipfsCid.startsWith("mock-ipfs-")) {
    return `https://picsum.photos/seed/${ipfsCid}/400/300`;
  }

  // Use Pinata gateway for best performance
  return `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
};
