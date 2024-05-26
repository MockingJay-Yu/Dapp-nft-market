import { ethers } from "ethers";
import abi from "../contracts/NftMarket.json";

const contractAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
let provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
console.log();
const contract = new ethers.Contract(contractAddress, abi, signer);

export async function buy(tokenId) {
  const result = await contract.buy(tokenId);
  console.log("buy", result.hash);
}

export async function changePrice(tokenId, price) {
  const result = await contract.changePrice(tokenId, price);
  console.log("change price", result.hash);
}

export async function cancelProduct(tokenId) {
  const result = await contract.cancelProduct(tokenId);
  console.log("cancel product", result.hash);
}

export async function getProducts() {
  console.log(111);
  const result = await contract.getProducts();
  console.log(result);
  return result;
}

export async function getProduct(tokenId) {
  const result = await contract.tokenIdToProduct(tokenId);
  return {
    seller: result[0],
    tokenId: Number(result[1]),
    price: Number(result[2] / 1e18),
  };
}
