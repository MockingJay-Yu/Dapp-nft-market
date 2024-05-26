import { ethers } from "ethers";
import abi from "../contracts/NFTM.json";
import axios from "axios";

const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const marketContractAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
let provider = new ethers.BrowserProvider(window.ethereum);
let signer = await provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

export async function balanceOf(address) {
  const result = await contract.balanceOf(address);
  return Number(result);
}

export async function ownerOf(tokenId) {
  const result = await contract.ownerOf(tokenId);
  return result;
}

export async function safeTransferFrom(tokenId, price) {
  const owner = await contract.ownerOf(tokenId);
  const address = await signer.getAddress();
  if (owner !== address) {
    return "You are not owner";
  }
  console.log(price);
  const data = ethers.toUtf8Bytes(price);
  console.log(data);

  const result = await contract[
    "safeTransferFrom(address, address, uint256, bytes)"
  ](address, marketContractAddress, tokenId, data);
  console.log(result);
}

export async function tokenOfOwnerByIndex(owner, index) {
  const result = await contract.tokenOfOwnerByIndex(owner, index);
  return Number(result);
}

export async function tokenURI(tokenId) {
  const result = await contract.tokenURI(tokenId);
  return result;
}

export async function getMetadata(tokenId) {
  const result = await contract.tokenURI(tokenId);
  const response = await axios.get(result);
  return {
    tokenId: tokenId,
    title: response.data.title,
    description: response.data.description,
    imageURL: response.data.image,
  };
}
