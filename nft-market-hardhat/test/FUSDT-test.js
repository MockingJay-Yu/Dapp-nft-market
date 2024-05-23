const hre = require("hardhat");
const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FUSDT", function () {
  async function deploy() {
    const FUSDTContractFactory = await hre.ethers.getContractFactory("FUSDT");
    const FUSDTContract = await FUSDTContractFactory.deploy();
    const [owner] = await hre.ethers.getSigners();
    return { FUSDTContract, owner };
  }

  describe("deployment", function () {
    it("Should name be fake USDT in market", async function () {
      const { FUSDTContract } = await loadFixture(deploy);
      expect(await FUSDTContract.name()).to.equal("fake USDT in market");
    });
    it("Should symbol be FUSDT", async function () {
      const { FUSDTContract } = await loadFixture(deploy);
      expect(await FUSDTContract.symbol()).to.equal("FUSDT");
    });
    it("Should set right banlance on owner", async function () {
      const { FUSDTContract, owner } = await loadFixture(deploy);
      const balanceOfOwner = await FUSDTContract.balanceOf(owner.address);
      expect(hre.ethers.formatEther(balanceOfOwner)).to.equal("10000000.0");
    });
    it("Should set right totalSupply", async function () {
      const { FUSDTContract } = await loadFixture(deploy);
      const totalSupply = await FUSDTContract.totalSupply();
      expect(hre.ethers.formatEther(totalSupply)).to.equal("10000000.0");
    });
  });
});
