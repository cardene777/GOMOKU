import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import { ContractFactory } from "ethers";
import {
  GMKController,
  GMKRouter,
  TestDepository,
  TestERC20,
} from "../../types";

export async function controllerFixture() {
  const signers = await ethers.getSigners();
  let admin: SignerWithAddress;
  [admin] = signers;

  const lsdToken = (await (
    await ethers.getContractFactory("TestERC20")
  ).deploy("LsdToken", "LSDT", 18)) as TestERC20;
  await lsdToken.deployed();

  const redeemable = (await (
    await ethers.getContractFactory("TestERC20")
  ).deploy("Redeemable", "RED", 18)) as TestERC20;
  const asset = (await (
    await ethers.getContractFactory("TestERC20")
  ).deploy("Asset", "ASS", 18)) as TestERC20;

  const GMKController = await ethers.getContractFactory("GMKController");
  const controller = (await upgrades.deployProxy(
    GMKController as ContractFactory,
    [lsdToken.address]
  )) as GMKController;

  const TestContract = await ethers.getContractFactory("TestContract");
  const market = await TestContract.deploy();
  await market.deployed();

  const router = (await (
    await ethers.getContractFactory("GMKRouter")
  ).deploy()) as GMKRouter;
  const depository = (await (
    await ethers.getContractFactory("TestDepository")
  ).deploy()) as TestDepository;
  await depository.initialize(market.address, lsdToken.address, asset.address);

  await (
    await router.registerDepository(depository.address, asset.address)
  ).wait();
  await (
    await router.registerDepository(depository.address, lsdToken.address)
  ).wait();
  await (await controller.whitelistAsset(asset.address, true)).wait();
  await (await controller.whitelistAsset(lsdToken.address, true)).wait();
  await (await controller.updateRouter(router.address)).wait();
  await (await controller.setRedeemable(redeemable.address)).wait();

  const transferAmount = ethers.utils.parseEther("100");
  await (await asset.transfer(controller.address, transferAmount)).wait();

  // Deposit collateral tokens to the depository
  await (await asset.approve(depository.address, transferAmount)).wait();
  await (await depository.deposit(asset.address, transferAmount)).wait();

  await (await lsdToken.transfer(controller.address, transferAmount)).wait();

  return { controller, router, depository, lsdToken, asset, redeemable };
}
