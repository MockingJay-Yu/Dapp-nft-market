const hre = require("hardhat");
const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const ethers = hre.ethers;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PRICE_NOT_ZERO =
  "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
const PRICE_CHANGE =
  "0x0000000000000000000000000000000000000000000000000000c6bf52634000";
const PRICE_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const TEST_URI = "https://localhost:8080/ipfs/otherSinger";

describe("NtfMarket", function () {
  async function deploy() {
    const FUSDTContractFactory = await ethers.getContractFactory("FUSDT");
    const NFTMContractFactory = await ethers.getContractFactory("NFTM");
    const NftMarketContractory = await ethers.getContractFactory("NftMarket");
    const FUSDTContract = await FUSDTContractFactory.deploy();
    const NFTMContract = await NFTMContractFactory.deploy();
    const NftMarketContract = await NftMarketContractory.deploy(
      FUSDTContract.target,
      NFTMContract.target
    );
    const [owner, singerA, singerB] = await ethers.getSigners();

    return {
      NftMarketContractory,
      FUSDTContract,
      NFTMContract,
      NftMarketContract,
      owner,
      singerA,
      singerB,
    };
  }

  describe("deployment", function () {
    it("Should return the error correctly when _erc20 equals zero address", async function () {
      const { NftMarketContractory, NFTMContract } = await loadFixture(deploy);
      await expect(
        NftMarketContractory.deploy(ZERO_ADDRESS, NFTMContract.target)
      ).to.revertedWith("ERC20 contract address can not be zero");
    });
    it("Should return the error correctly when _erc721 equals zero address", async function () {
      const { NftMarketContractory, FUSDTContract } = await loadFixture(deploy);
      await expect(
        NftMarketContractory.deploy(FUSDTContract.target, ZERO_ADDRESS)
      ).to.revertedWith("ERC721 contract address can not be zero");
    });
  });

  describe("onERC721Received", function () {
    it("Should return the error correctly when caller is not ERC721", async function () {
      const { NftMarketContract, singerA } = await loadFixture(deploy);
      await expect(
        NftMarketContract.onERC721Received(
          singerA.address,
          singerA.address,
          0,
          PRICE_NOT_ZERO
        )
      ).to.revertedWith("Only the ERC721 contract can call this function");
    });
    it("Should return the error correctly when price is zero", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      const txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait(1);
      await expect(
        //safeTransferFrom有同名不同参数的方法，要用这种方式调用
        NFTMContract["safeTransferFrom(address, address, uint256, bytes)"](
          owner.address,
          NftMarketContract.target,
          0,
          PRICE_ZERO
        )
      ).to.revertedWith("Price can not be zero");
    });
    it("Should be listed correctly", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      const txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait(1);
      const tx = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await expect(tx)
        .to.emit(NftMarketContract, "addProduct")
        .withArgs(0, owner.address, owner.address, 500000000000000);
      const productInMapping = await NftMarketContract.tokenIdToProduct(0);
      expect(productInMapping.tokenId).to.equal(0);
      expect(productInMapping.price).to.equal(500000000000000);
      expect(productInMapping.seller).to.equal(owner.address);
      const productInArray = await NftMarketContract.products(0);
      expect(productInArray.tokenId).to.equal(0);
      expect(productInArray.price).to.equal(500000000000000);
      expect(productInArray.seller).to.equal(owner.address);
      expect(await NftMarketContract.indexInProducts(0)).to.equal(0);
      expect(await NFTMContract.ownerOf(0)).to.equal(NftMarketContract.target);
    });
  });

  describe("cancelProduct", function () {
    it("Should correctly return when tokenId does not exist ", async function () {
      const { NftMarketContract } = await loadFixture(deploy);
      await expect(NftMarketContract.cancelProduct(0)).to.revertedWith(
        "TokenId is Not Exists"
      );
    });
    it("Should correctly return when not called by seller", async function () {
      const { NftMarketContract, NFTMContract, owner, singerA } =
        await loadFixture(deploy);
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      await expect(
        NftMarketContract.connect(singerA).cancelProduct(0)
      ).to.revertedWith("You are not seller");
    });
    it("Should be remove correctly", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      txResponse = await NftMarketContract.cancelProduct(0);
      await expect(txResponse)
        .to.emit(NftMarketContract, "removeProduct")
        .withArgs(0, owner.address);
      await expect(NftMarketContract.products(0)).to.reverted;
      const product = await NftMarketContract.tokenIdToProduct(0);
      expect(product.price).to.equal("0");
      const index = await NftMarketContract.indexInProducts(0);
      expect(index).to.equal("0");
    });
  });
  describe("changePrice", function () {
    it("Should correctly return when tokenId does not exist ", async function () {
      const { NftMarketContract } = await loadFixture(deploy);
      await expect(
        NftMarketContract.changePrice(0, PRICE_NOT_ZERO)
      ).to.revertedWith("TokenId is Not Exists");
    });
    it("Should correctly return when price is zero", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      await expect(
        NftMarketContract.changePrice(0, PRICE_ZERO)
      ).to.revertedWith("Price can not be zero");
    });
    it("Should correctly return when not called by seller", async function () {
      const { NftMarketContract, NFTMContract, owner, singerA } =
        await loadFixture(deploy);
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      await expect(
        NftMarketContract.connect(singerA).changePrice(0, PRICE_CHANGE)
      ).to.rejectedWith("You are not seller");
    });
    it("Should be change correctly", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      txResponse = await NftMarketContract.changePrice(0, PRICE_CHANGE);
      await expect(txResponse)
        .to.emit(NftMarketContract, "modifiyPrice")
        .withArgs(0, PRICE_NOT_ZERO, PRICE_CHANGE);
      const product = await NftMarketContract.tokenIdToProduct(0);
      expect(product.price).to.equal(PRICE_CHANGE);
    });
  });
  describe("buy", function () {
    it("Should correctly return when tokenId does not exist ", async function () {
      const { NftMarketContract } = await loadFixture(deploy);
      await expect(NftMarketContract.buy(0, PRICE_NOT_ZERO)).to.revertedWith(
        "TokenId is Not Exists"
      );
    });
    it("Should correctly return when the price is not equal", async function () {
      const { NftMarketContract, NFTMContract, owner } = await loadFixture(
        deploy
      );
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      await expect(NftMarketContract.buy(0, PRICE_CHANGE)).to.revertedWith(
        "Price is not equal"
      );
    });
    it("Should correctly return when FUSDT transfer fail", async function () {
      const { NftMarketContract, NFTMContract, FUSDTContract, owner, singerA } =
        await loadFixture(deploy);
      let txResponse;
      txResponse = await NFTMContract.safeMint(owner.address, TEST_URI);
      await txResponse.wait();
      txResponse = await NFTMContract[
        "safeTransferFrom(address, address, uint256, bytes)"
      ](owner.address, NftMarketContract.target, 0, PRICE_NOT_ZERO);
      await txResponse.wait();
      txResponse = await FUSDTContract.transfer(
        singerA.address,
        500000000000000
      );
      await txResponse.wait();
      txResponse = await FUSDTContract.connect(singerA).approve(
        NftMarketContract.target,
        500000000000000
      );
      await txResponse.wait();
      txResponse = await NftMarketContract.connect(singerA).buy(
        0,
        500000000000000
      );
      await expect(txResponse)
        .to.emit(NftMarketContract, "deal")
        .withArgs(0, singerA.address, owner.address, 500000000000000);
      expect(await FUSDTContract.balanceOf(singerA.address)).to.equal(0);
      expect(await NFTMContract.ownerOf(0)).to.equal(singerA.address);
      await expect(NftMarketContract.products(0)).to.reverted;
      const product = await NftMarketContract.tokenIdToProduct(0);
      expect(product.price).to.equal("0");
      const index = await NftMarketContract.indexInProducts(0);
      expect(index).to.equal("0");
    });
  });
});
