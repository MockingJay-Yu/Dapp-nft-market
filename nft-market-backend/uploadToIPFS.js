import { create } from "kubo-rpc-client";
import fs from "fs";
import "dotenv/config";

const ipfs = create(process.env.IPFS_UPLOAD_ADDRESS);

export async function uploadFileToIPFS(filePath) {
  const file = fs.readFileSync(filePath);
  const result = await ipfs.add({ path: filePath, content: file });
  return result;
}

export async function uploadJSONToIPFS(json) {
  const result = await ipfs.add(JSON.stringify(json));
  return result;
}
