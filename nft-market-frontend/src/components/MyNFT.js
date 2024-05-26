import { useState, useEffect } from "react";
import { balanceOf, tokenOfOwnerByIndex, getMetadata } from "../util/NFTM.js";
import { useNavigate } from "react-router-dom";

const MyNFT = ({ address }) => {
  const [nfts, setNfts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNFTs = async () => {
      console.log(address);
      const length = await balanceOf(address);
      console.log(length);
      if (length === 0) {
        return;
      }
      const newNfts = [];
      for (let i = 0; i < length; i++) {
        const tokenId = await tokenOfOwnerByIndex(address, i);
        const NFT = await getMetadata(tokenId);
        newNfts.push(NFT);
      }
      setNfts(newNfts);
    };
    fetchNFTs();
  }, []);

  return (
    <div className="my-nft">
      {nfts.map((nft) => (
        <div key={nft.tokenId} className="nft-item">
          <h3 className="nft-title">title: {nft.title}</h3>
          <p className="nft-description">description: {nft.description}</p>
          <img src={nft.imageURL} alt={nft.title} className="nft-image" />
          <button
            className="nft-button"
            onClick={() => navigate(`/detail/${nft.tokenId}`)}
          >
            detail
          </button>
        </div>
      ))}
    </div>
  );
};

export default MyNFT;
