import { ethers } from "ethers";
import abi from "../contracts/FUSDT.json";

let provider = new ethers.BrowserProvider(window.ethereum);
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const contract = new ethers.Contract(
  contractAddress,
  abi,
  await provider.getSigner()
);

export async function approve(spender, amount) {
  const result = await contract.approve(spender, amount);
  console.log(result.hash);
}

export async function getAllowance(owner, spender) {
  const result = await contract.allowance(owner, spender);
  console.log(result.hash);
}
