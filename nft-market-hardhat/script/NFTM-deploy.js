const hre = require("hardhat");

async function deploy() {
  const contractFactory = await hre.ethers.getContractFactory("NFTM");
  const contract = await contractFactory.deploy();
}
deploy().then((result) => {});
