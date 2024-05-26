const hre = require("hardhat");

async function deploy() {
  const FUSDTFactory = await hre.ethers.getContractFactory("FUSDT");
  const FUSDT = await FUSDTFactory.deploy();
  console.log(FUSDT.target);

  const NFTMFactory = await hre.ethers.getContractFactory("NFTM");
  const NFTM = await NFTMFactory.deploy();
  console.log(NFTM.target);

  const NftMarketFactory = await hre.ethers.getContractFactory("NftMarket");
  const NftMarket = await NftMarketFactory.deploy(FUSDT.target, NFTM.target);
  console.log(NftMarket.target);
}

deploy().then((result) => {});
