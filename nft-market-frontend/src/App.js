import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import UploadSuccess from "./components/UploadSuccess.js";
import UploadImage from "./components/UploadImage.js";
import HomePage from "./components/HomePage.js";
import MyNFT from "./components/MyNFT.js";
import NFTDetail from "./components/NFTDetail.js";

function App() {
  const [walletAddress, setWallet] = useState("");

  useEffect(() => {
    //getWalletAddress();
    addWalletListener();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
        }
      });
    }
  }

  const getWalletAddress = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts[0]);
        setWallet(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  return (
    <div id="container">
      <Router>
        <Navbar onConnectWallet={getWalletAddress} address={walletAddress} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create"
            element={<UploadImage address={walletAddress} />}
          />
          <Route path="/myNFT" element={<MyNFT address={walletAddress} />} />
          <Route path="/detail/:tokenId" element={<NFTDetail />} />
          <Route path="/success" element={<UploadSuccess />} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;
