import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { GMKController, TestERC20 } from "../../types";
import { controllerFixture } from "../fixtures/controllerFixture";

chai.use(solidity);

describe("GMKController", async () => {
  let controller: GMKController;
  let admin: SignerWithAddress;
  let bob: SignerWithAddress;
  const governorParams = {
    votingDelay: 160,
    votingPeriod: 1500,
    proposalThreshold: 1,
    quorumFraction: 10,
  };

  beforeEach(async () => {
    [admin, bob] = await ethers.getSigners();
  });

  it("can mint", async () => {
    let { controller, asset } = await loadFixture(controllerFixture);
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;
    await (await asset.approve(controller.address, amount)).wait();
    await expect(
      controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).to.emit(controller, "Minted");
  });

  it("can mint with ERC20", async () => {
    let { controller } = await loadFixture(controllerFixture);
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;
    await expect(
      controller.mintWithERC20(minAmountOut, amount, bob.address)
    ).to.emit(controller, "Minted");
  });

  it("can redeem", async () => {
    let { controller, asset, redeemable } = await loadFixture(
      controllerFixture
    );
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;

    await (await asset.approve(controller.address, amount)).wait();
    await (
      await controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).wait();

    await (await redeemable.approve(controller.address, amount)).wait();
    await expect(
      controller.redeem(asset.address, amount, minAmountOut, bob.address)
    ).to.emit(controller, "Redeemed");
  });

  it("can redeem for ERC20", async () => {
    let { controller, redeemable, asset } = await loadFixture(
      controllerFixture
    );
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;

    await (await asset.approve(controller.address, amount)).wait();
    await (
      await controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).wait();

    await (await redeemable.approve(controller.address, amount)).wait();
    await expect(
      controller.redeemForLsToken(amount, minAmountOut, bob.address)
    ).to.emit(controller, "Redeemed");
  });

  it("can add and remove whitelisted assets", async () => {
    let { controller } = await loadFixture(controllerFixture);
    const whtitelistBeforeAdd = await controller.getWhitelistedAssets();
    const newAsset = (await (
      await ethers.getContractFactory("TestERC20")
    ).deploy("New Asset", "NEW", 18)) as TestERC20;

    await (await controller.whitelistAsset(newAsset.address, true)).wait();
    const whtitelistAfterAdd = await controller.getWhitelistedAssets();
    expect(whtitelistAfterAdd.length).to.eq(whtitelistBeforeAdd.length + 1);
    let isWhitelisted = await controller.whitelistedAssets(newAsset.address);
    expect(isWhitelisted).to.be.true;

    await (await controller.whitelistAsset(newAsset.address, false)).wait();
    const whtitelistAfterRemove = await controller.getWhitelistedAssets();
    expect(whtitelistAfterRemove.length).to.eq(whtitelistBeforeAdd.length);
    isWhitelisted = await controller.whitelistedAssets(newAsset.address);
    expect(isWhitelisted).to.be.false;
  });

  it("reverts on mint when not whitelisted or allowed", async () => {
    let { controller, asset } = await loadFixture(controllerFixture);
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;
    await (await asset.approve(controller.address, 0)).wait();
    await expect(
      controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).to.be.revertedWith("CtrlNotApproved");

    await (await controller.whitelistAsset(asset.address, false)).wait();
    await (await asset.approve(controller.address, amount)).wait();
    await expect(
      controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).to.be.revertedWith("CtrlNotWhitelisted");
  });

  it("can still redeem when whitelisted asset is unwhitelisted", async () => {
    let { controller, asset, redeemable } = await loadFixture(
      controllerFixture
    );
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = 0;
    await (await redeemable.approve(controller.address, 0)).wait();
    await (await controller.whitelistAsset(asset.address, true)).wait();
    await expect(
      controller.redeem(asset.address, amount, minAmountOut, bob.address)
    ).to.be.revertedWith("CtrlNotApproved");
    await expect(
      controller.mintWithERC20(minAmountOut, amount, bob.address)
    ).to.emit(controller, "Minted");

    await (await controller.whitelistAsset(asset.address, false)).wait();
    await (await redeemable.approve(controller.address, amount)).wait();
    await expect(
      controller.redeemForLsToken(amount, minAmountOut, bob.address)
    ).to.emit(controller, "Redeemed");
  });

  it("reverts if minAmount not met", async () => {
    let { controller, asset, redeemable } = await loadFixture(
      controllerFixture
    );
    let amount = ethers.utils.parseEther("1");
    let minAmountOut = ethers.utils.parseEther("10");
    await (await asset.approve(controller.address, amount)).wait();
    await (await controller.whitelistAsset(asset.address, true)).wait();
    await expect(
      controller.mint(asset.address, amount, minAmountOut, bob.address)
    ).to.be.revertedWith("CtrlMinNotMet");

    await (await controller.mint(asset.address, amount, 0, bob.address)).wait();

    await (await redeemable.approve(controller.address, amount)).wait();
    await expect(
      controller.redeem(asset.address, amount, minAmountOut, bob.address)
    ).to.be.revertedWith("CtrlMinNotMet");
  });

  it("whitelisting asset multiple times does nothing", async () => {
    let { controller } = await loadFixture(controllerFixture);
    const whtitelistBeforeAdd = await controller.getWhitelistedAssets();
    const newAsset = (await (
      await ethers.getContractFactory("TestERC20")
    ).deploy("New Asset", "NEW", 18)) as TestERC20;

    // add twice
    await (await controller.whitelistAsset(newAsset.address, true)).wait();
    const whtitelistAfterAdd = await controller.getWhitelistedAssets();
    expect(whtitelistAfterAdd.length).to.eq(whtitelistBeforeAdd.length + 1);

    await (await controller.whitelistAsset(newAsset.address, true)).wait();
    const whtitelistAfter2ndAdd = await controller.getWhitelistedAssets();
    expect(whtitelistAfterAdd.length).to.eq(whtitelistAfter2ndAdd.length);

    let isWhitelisted = await controller.whitelistedAssets(newAsset.address);
    expect(isWhitelisted).to.be.true;
  });

  it("reverts if using non-contract", async () => {
    let { controller } = await loadFixture(controllerFixture);

    await expect(controller.updateRouter(bob.address)).to.be.revertedWith(
      "CtrlAddressNotContract"
    );
  });

  it("can throw if trying to set redeemable after it's already set", async () => {
    let { controller } = await loadFixture(controllerFixture);
    let TestERC20 = await ethers.getContractFactory("TestERC20");

    let newRedeemable = await (
      await TestERC20.deploy("NEW", "NEW", 18)
    ).deployed();
    await expect(
      controller.setRedeemable(newRedeemable.address)
    ).to.be.revertedWith("CtrlRedeemableAlreadySet");
  });
});
