import { Contract, ethers } from "ethers";

export async function mint(to, uri) {
  const abi = ["function safeMint(address to, string uri)"];
  const provide = new ethers.JsonRpcProvider(process.env.EthEREUM_JSON_RPC);
  const signer = await provide.getSigner();
  const contract = new Contract(process.env.NFTM_CONTRACT_ADDRESS, abi, signer);
  await contract.safeMint(to, uri);
}
