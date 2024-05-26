import React from "react";
import { Link } from "react-router-dom";

function Navbar({ onConnectWallet, address }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">NFT MarketPlace</div>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          <span className="link-text">Home</span>
        </Link>
        <Link to="/create" className="navbar-link">
          <span className="link-text">Create NFT</span>
        </Link>
        <Link to="/myNFT" className="navbar-link">
          <span className="link-text">My NFT</span>
        </Link>
      </div>
      <div className="navbar-buttons">
        <button className="connect-wallet-button" onClick={onConnectWallet}>
          {address ? `Wallet: ${address.slice(0, 8)}...` : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
