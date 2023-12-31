import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { loadConfig, loadCoreContracts } from "../common/loaders";

let bob: SignerWithAddress;
let admin: SignerWithAddress;
let tx;

async function main() {
  const hre = await import("hardhat");
  const config = (await loadConfig(hre)) as OptimismConfig;
  const coreContracts = await loadCoreContracts(hre);
  console.log(">>> Deposit WETH collateral and mint GMK");
  const signers = await ethers.getSigners();
  [admin, bob] = signers;
  const Controller = await ethers.getContractFactory("GMKController");

  const controller = Controller.attach(coreContracts.controller);
  const GMK = await ethers.getContractFactory("GMKToken");
  const uxdToken = GMK.attach(coreContracts.uxd);

  const ERC20 = await ethers.getContractFactory("TestERC20");
  const WETH9 = ERC20.attach(config.tokens.WETH);

  const wethAmount = ethers.utils.parseEther("0.01");

  let uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));
  console.log("approving WETH");
  tx = await WETH9.approve(controller.address, wethAmount);
  await tx.wait();

  console.log("minting with WETH");
  tx = await controller.mint(
    config.tokens.WETH,
    wethAmount,
    0,
    config.addresses.Deployer
  );
  console.log("mint with WETH tx = ", tx.hash);
  await tx.wait();

  uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
