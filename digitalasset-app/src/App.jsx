import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import Background from "./components/Background";
import ConnectWallet from "./components/ConnectWallet";
import AssetGallery from "./components/AssetGallery";
import AssetForm from "./components/AssetForm";
import TransferForm from "./components/TransferForm";
import VerifyForm from "./components/VerifyForm";
import { Web3Provider } from "./contexts/Web3Context";

function App() {
  const [activeTab, setActiveTab] = useState("gallery");

  return (
    <Web3Provider>
      <div className="app-container">
        <Background />
        <div className="content-wrapper">
          <Header setActiveTab={setActiveTab} activeTab={activeTab} />
          <main className="container main-content">
            <ConnectWallet />

            <div className="tab-content">
              {activeTab === "gallery" && <AssetGallery />}
              {activeTab === "register" && <AssetForm />}
              {activeTab === "transfer" && <TransferForm />}
              {activeTab === "verify" && <VerifyForm />}
            </div>
          </main>
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Web3Provider>
  );
}

export default App;
