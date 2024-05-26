import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { approve, getAllowance } from "../util/FUSDT.js";
import { getMetadata, safeTransferFrom } from "../util/NFTM.js";
import { buy, getProduct } from "../util/NtfMarket.js";

const NFTDetail = () => {
  const { tokenId } = useParams();
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    imageURL: "",
  });
  const [product, setProduct] = useState({
    seller: "",
    price: "",
    tokenId: "",
  });

  const getWalletAddress = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        return accounts[0];
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  // const handleBuyClick = async () => {
  //   if (allowance === 0) {
  //     await approve();
  //   } else {
  //     await buy(tokenId);
  //   }
  // };

  const handleListingClick = async () => {
    const price = prompt("Please enter the price: ");
    if (price) {
      const result = await safeTransferFrom(tokenId, price);
      if (result == "You are not owner") {
        alert(result);
      }
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      const address = await getWalletAddress();
      const metadata = await getMetadata(tokenId);
      console.log(metadata);
      const product = await getProduct(tokenId);
      console.log(product);

      setMetadata(metadata);
      setProduct(product);
    };
    getInfo();
  }, []);

  return (
    <div className="nft-detail">
      <div className="nft-image">
        <img src={metadata.imageURL}></img>
      </div>
      <div className="nft-info">
        <p>token Id: {product.tokenId}</p>
        <p>title: {metadata.title}</p>
        <p>description: {metadata.description}</p>
        {product.seller && <p>seller: {product.seller}</p>}
        {product.price !== 0 && <p>price: {product.price}</p>}
        <button className="btn" onClick={handleListingClick}>
          Listing
        </button>
        <button className="btn">Delisting</button>
        <button className="btn">ModifyPrice</button>
        <button className="btn">Buy</button>
      </div>
    </div>
  );
};

export default NFTDetail;
