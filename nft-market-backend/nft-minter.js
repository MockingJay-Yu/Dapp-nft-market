import { Contract, ethers } from "ethers";

export async function mint(to, uri) {
  const abi = [
    "function safeMint(address to, string uri)",
    "function balanceOf(address owner)",
  ];
  const provide = new ethers.JsonRpcProvider(process.env.EthEREUM_JSON_RPC);
  const signer = await provide.getSigner();
  const contract = new Contract(process.env.NFTM_CONTRACT_ADDRESS, abi, signer);
  console.log(contract.target);
  console.log(to);
  console.log(uri);
  const txResponse = await contract.safeMint(to, uri);
  const reciept = await txResponse.wait();
  console.log(reciept);

  const balanceOf = await contract.balanceOf(to);
  console.log(balanceOf);
}
