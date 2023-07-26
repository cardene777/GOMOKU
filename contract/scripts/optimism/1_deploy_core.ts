import fs from "fs";
import { ethers, network, upgrades } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { GMKController, GMKRouter, GMKToken } from "../../types";
import { NetworkName, checkNetwork } from "../common/checkNetwork";
import { loadConfig } from "../common/loaders";
import { verify } from "../common/verify";

// global consts and vars
let config: OptimismConfig;
let controller: GMKController;
let router: GMKRouter;
let uxd: GMKToken;

async function main() {
  const hre = await import("hardhat");
  checkNetwork(hre, [NetworkName.Optimism, NetworkName.OptimismGoerli]);

  config = (await loadConfig(hre)) as OptimismConfig;

  await deployContracts();
  await verifyContracts();
  await setup();
  await save();
}

async function deployContracts() {
  console.log(">>> Deploying contracts...");

  console.log("0 - ready to start");

  console.log("1 - ready to deploy controller");
  const GMKController = await ethers.getContractFactory("GMKController");
  controller = (await upgrades.deployProxy(
    GMKController,
    [config.tokens.WETH],
    { kind: "uups" }
  )) as GMKController;
  await controller.deployed();
  console.log(`GMKController deployed to ${controller.address} ✅`);

  console.log("2 - ready to deploy router");
  const Router = await ethers.getContractFactory("GMKRouter");
  router = (await Router.deploy()) as GMKRouter;
  await router.deployed();
  console.log(`Router deployed to => ${router.address} ✅`);

  console.log("3 - ready to deploy GMKToken");
  const GMKToken = await ethers.getContractFactory("GMKToken");
  uxd = (await GMKToken.deploy(
    controller.address,
    config.layerZero.current.endpoint
  )) as GMKToken;
  await uxd.deployed();
  console.log(`GMK token deployed to address:  ${uxd.address} ✅`);
}

async function verifyContracts() {
  console.log(">>> Verifying contracts...");

  // GMKController
  console.log(`> Verifying controller: ${controller.address}`);
  await verify(
    controller.address,
    [],
    "contracts/core/GMKController.sol:GMKController"
  );

  const controllerImpl = await upgrades.erc1967.getImplementationAddress(
    controller.address
  );
  console.log(`> Verifying controllerImpl: ${controllerImpl}`);
  await verify(controllerImpl);

  // GMKRouter
  console.log(`> Verifying router: ${router.address}`);
  await verify(router.address);

  // GMK token
  console.log(`> Verifying GMK token: ${uxd.address}`);
  await verify(uxd.address, [
    controller.address,
    config.layerZero.current.endpoint,
  ]);
  console.log("Contract verification done ✅");

  const contractAddresses = [
    {
      name: "GMKController",
      address: controllerImpl,
    },
    {
      name: "GMKRouter",
      address: router.address,
    },
    {
      name: "GMKToken",
      address: uxd.address,
    },
  ];
  // await hre.tenderly.persistArtifacts(...contractAddresses);

  console.log("Contract verification done ✅");
}

async function setup() {
  await (await controller.whitelistAsset(config.tokens.WETH, true)).wait();
  await (await controller.whitelistAsset(config.tokens.USDC, true)).wait();
  await (await controller.updateRouter(router.address)).wait();

  const mintCap = ethers.utils.parseEther("2000000");
  console.log("2 - setting redeemable token address in controller");
  await (await controller.setRedeemable(uxd.address)).wait();
  await (await uxd.setLocalMintCap(mintCap)).wait();
}

async function save() {
  const config = `
  {
    "controller": "${controller.address}",
    "router": "${router.address}",
    "uxd": "${uxd.address}"
  }

  `;
  const folderPath = `./addresses/${network.name}`;
  fs.mkdirSync(folderPath, { recursive: true });
  const data = JSON.stringify(config);
  const filename = `${folderPath}/core.json`;
  fs.writeFileSync(filename, JSON.parse(data));
  console.log(`Address written to file: ${filename}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
