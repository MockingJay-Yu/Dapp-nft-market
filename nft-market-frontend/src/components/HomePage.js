import { getProducts } from "../util/NtfMarket.js";
import { tokenURI } from "../util/NFTM.js";
import axios from "axios";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 主页组件，用来显示所有NFT
function HomePage() {
  const [nfts, setNFTs] = useState([]); // 使用state来存储NFT数据
  const navigate = useNavigate();

  // 组件加载时查询NFT
  useEffect(() => {
    const getAllNfts = async () => {
      let result;
      result = await getProducts();
      const length = result.length;
      if (length === 0) {
        return;
      }
      const newNfts = [];
      for (let i = 0; i < length; i++) {
        const tokenId = result[i][0];
        const metadata = await tokenURI(tokenId);
        const response = await axios.get(metadata);
        const imageURL = response.data.image;
        newNfts.push({
          tokenId: result[i][0],
          price: result[i][1],
          seller: result[i][2],
          imageURL: imageURL,
        });
      }
      setNFTs(newNfts);
    };
    getAllNfts();
  }, []); // 空的依赖数组意味着这个effect只会在组件挂载时运行

  return (
    <div>
      {nfts.map((nft) => (
        <div key={nft.tokenId}>
          <p>tokenId: {nft.tokenId}</p>
          <p>price: {nft.price}</p>
          <p>seller: {nft.seller}</p>
          <img src={nft.imageURL} />
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
}

export default HomePage;
