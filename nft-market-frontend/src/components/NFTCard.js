import { useEffect, useState } from "react";

import { getMetadata } from "../util/NFTM.js";
import { getProduct } from "../util/NtfMarket.js";

const NFTCard = ({ tokenId, onclick }) => {
  const [metadata, setMetadata] = useState("");
  const [product, setProduct] = useState("");

  useEffect(() => {
    const getInfo = async () => {
      const metadata = await getMetadata(tokenId);
      const product = await getProduct(tokenId);

      setMetadata(metadata);
      setProduct(product);
    };
    getInfo();
  }, [tokenId]);

  return (
    <div className="nft-card" onclick={onclick}>
      <div className="nft-image">
        <img src={metadata.imageURL} alt={metadata.title} />
      </div>
      <div className="nft-info">
        <h3>{metadata.title}</h3>
        <p>Price: {product.price} FUSDT</p>
      </div>
    </div>
  );
};

export default NFTCard;
