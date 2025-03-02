# Digital Asset Management

A blockchain-based solution for securing and managing digital assets using Ethereum smart contracts and IPFS.

## Overview

This project leverages blockchain technology—specifically the Ethereum blockchain—to secure and manage digital assets. Digital assets include digital artworks, tokens, and other forms of valuable digital property. The solution uses Ethereum smart contracts for asset registration and ownership management, while utilizing Pinata's IPFS service for decentralized storage of the actual asset files.

The system provides:

- Secure digital asset registration on the Ethereum blockchain
- Immutable records of asset ownership and transfer history
- Asset integrity verification using cryptographic proofs
- User-friendly interface for managing digital assets

## Technologies Used

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract Development**: Solidity, Remix IDE
- **Frontend**: React + Vite
- **Decentralized Storage**: Pinata IPFS
- **Web3 Integration**: ethers.js

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MetaMask browser extension
- An Ethereum account with some Sepolia testnet ETH

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/SundayOlubode/digital_asset_management.git
   cd digital_asset_management
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   VITE_CONTRACT_ADDRESS=<your_deployed_contract_address>
   VITE_PINATA_API_KEY=<your_pinata_api_key>
   VITE_PINATA_SECRET_KEY=<your_pinata_secret_key>
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Connecting Your Wallet

1. Ensure MetaMask is installed in your browser
2. Connect your wallet to the application by clicking the "Connect Wallet" button
3. Make sure your MetaMask is connected to the Sepolia testnet

### Registering a Digital Asset

1. Navigate to the "Register Asset" page
2. Fill in the asset details (name, description, etc.)
3. Upload the digital file (image, document, etc.)
4. Click "Register Asset" to mint your digital asset
5. Confirm the transaction in MetaMask

### Viewing Your Assets

1. Navigate to the "My Assets" page to see all assets owned by your address
2. Click on an asset to view its details, including ownership history

### Transferring Ownership

1. Navigate to the "My Assets" page
2. Select the asset you wish to transfer
3. Click "Transfer Ownership"
4. Enter the recipient's Ethereum address
5. Confirm the transaction in MetaMask

## Smart Contract

The smart contract for this project was deployed on the Sepolia Ethereum testnet using Remix IDE. The contract handles:

- Asset registration with metadata and IPFS hash
- Ownership management and transfer
- Historical record of all ownership transfers
- Asset verification using cryptographic proofs

## Future Improvements

- Implement batch asset registration
- Add support for different asset types with specialized metadata
- Integrate more advanced search and filtering capabilities
- Develop a mobile application for easier access
- Implement royalty payments for creators on transfers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or suggestions, please open an issue on GitHub or contact the repository owner.

---

Project Link: [https://github.com/SundayOlubode/digital_asset_management](https://github.com/SundayOlubode/digital_asset_management)
