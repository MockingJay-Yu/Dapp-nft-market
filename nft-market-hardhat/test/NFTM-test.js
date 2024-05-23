const hre = require("hardhat");
const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const TEST_URI = "https://localhost:8080/ipfs/otherSinger";
describe("NFTM", function () {
  async function deploy() {
    const NFTMContractFactory = await hre.ethers.getContractFactory("NFTM");
    const NFTMContract = await NFTMContractFactory.deploy();
    const [owner, otherSinger] = await hre.ethers.getSigners();
    return { NFTMContract, owner, otherSinger };
  }

  describe("deployment", function () {
    it("Should name be right", async function () {
      const { NFTMContract } = await loadFixture(deploy);
      expect(await NFTMContract.name()).to.equal("NFTM");
    });
    it("Should symbol be right", async function () {
      const { NFTMContract } = await loadFixture(deploy);
      expect(await NFTMContract.symbol()).to.equal("NFTM");
    });
    it("Should owner be right", async function () {
      const { NFTMContract, owner } = await loadFixture(deploy);
      expect(await NFTMContract.owner()).to.equal(owner.address);
    });
  });
  describe("safeMint", function () {
    it("Should correctly minted", async function () {
      const { NFTMContract, otherSinger } = await loadFixture(deploy);
      const txResponse = await NFTMContract.safeMint(
        otherSinger.address,
        TEST_URI
      );
      await txResponse.wait();
      expect(await NFTMContract.ownerOf(0)).to.equal(otherSinger.address);
      expect(await NFTMContract.tokenURI(0)).to.equal(TEST_URI);
    });
  });
});
