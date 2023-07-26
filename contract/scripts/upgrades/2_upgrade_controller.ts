import "@nomiclabs/hardhat-etherscan";
import { ethers } from "hardhat";
import { EthereumConfig, OptimismConfig } from "../../config/configs";
import { ControllerImplContract, CoreContracts } from "../../config/contracts";
import { GMKController } from "../../types";
import {
  loadConfig,
  loadControllerImpl,
  loadCoreContracts,
} from "../common/loaders";

// global consts and vars
let controller: GMKController;
let config: OptimismConfig | OptimismConfig | EthereumConfig;
let coreContracts: CoreContracts;
let controllerImpl: ControllerImplContract;

async function main() {
  const hre = await import("hardhat");
  config = await loadConfig(hre);
  coreContracts = await loadCoreContracts(hre);
  controllerImpl = await loadControllerImpl(hre);
  // We get the contract to deploy
  await upgradeContracts();
}

async function upgradeContracts() {
  console.log(">>> Upgrading contract...");

  console.log("1 - ready to upgrade controller");
  const GMKController = await ethers.getContractFactory("GMKController");
  controller = GMKController.attach(coreContracts.controller) as GMKController;

  await (await controller.upgradeTo(controllerImpl.controllerImpl)).wait();

  console.log(
    `GMKController upgraded [Data=>Logic] [${controller.address}=>${controllerImpl.controllerImpl} ✅`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
