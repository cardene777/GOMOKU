import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { loadConfig, loadCoreContracts } from "../common/loaders";

let bob: SignerWithAddress;
let admin: SignerWithAddress;
let tx;

async function main() {
  const hre = await import("hardhat");
  console.log(">>> Redeem ETH and burn GMK");
  const config = (await loadConfig(hre)) as OptimismConfig;
  const coreContracts = await loadCoreContracts(hre);
  const signers = await ethers.getSigners();
  [admin, bob] = signers;
  const Controller = await ethers.getContractFactory("GMKController");
  const controller = Controller.attach(coreContracts.controller);

  const GMK = await ethers.getContractFactory("GMKToken");
  const uxdToken = GMK.attach(coreContracts.uxd);
  let uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));

  const uxdAmount = ethers.utils.parseEther("10.0");
  console.log("Approving GMK");
  await (await uxdToken.approve(controller.address, uxdAmount)).wait();

  // // redeem WETH
  console.log("redeeming with WETH");
  tx = await controller.redeem(
    config.tokens.WETH,
    uxdAmount,
    0,
    config.addresses.Deployer
  );
  await tx.wait();
  console.log("redeem tx = ", tx.hash);

  uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
