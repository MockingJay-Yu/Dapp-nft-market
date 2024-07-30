const hre = require("hardhat");

async function deploy() {
  try {
    const FUSDTFactory = await hre.ethers.getContractFactory("FUSDT");
    const FUSDT = await FUSDTFactory.deploy();
    console.log(FUSDT.target);

    const NFTMFactory = await hre.ethers.getContractFactory("NFTM");
    const NFTM = await NFTMFactory.deploy();
    console.log(NFTM.target);

    const NftMarketFactory = await hre.ethers.getContractFactory("NftMarket");
    const NftMarket = await NftMarketFactory.deploy(FUSDT.target, NFTM.target);
    console.log(NftMarket.target);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

deploy().then(() => process.exit(0));
