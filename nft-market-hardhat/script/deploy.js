const ethers = hre.ethers;

async function deploy() {
  try {
    const FUSDTFactory = await ethers.getContractFactory("FUSDT");
    const FUSDT = await FUSDTFactory.deploy();
    console.log(FUSDT.target);

    const NFTMFactory = await ethers.getContractFactory("NFTM");
    const NFTM = await NFTMFactory.deploy();
    console.log(NFTM.target);

    const NftMarketFactory = await ethers.getContractFactory("NftMarket");
    const NftMarket = await NftMarketFactory.deploy(FUSDT.target, NFTM.target);
    console.log(NftMarket.target);
    return {
      FUSDTContract: FUSDT,
      NFTMContract: NFTM,
      NftMarketContract: NftMarket,
    };
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

module.exports = { deploy };
if (require.main === module) {
  deploy().then(() => process.exit(0));
}
