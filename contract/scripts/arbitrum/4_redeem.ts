import { ethers } from "hardhat";
import { ArbitrumConfig } from "../../config/configs";
import { checkNetwork, NetworkName } from "../common/checkNetwork";
import { loadConfig, loadCoreContracts } from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  checkNetwork(hre, [NetworkName.ArbitrumGoerli, NetworkName.ArbitrumOne]);

  const signer = (await ethers.getSigners())[0];
  const config = (await loadConfig(hre)) as ArbitrumConfig;
  const contracts = await loadCoreContracts(hre);
  const uxdAmount = ethers.utils.parseEther("10.0");

  const Controller = await ethers.getContractFactory("GMKController");
  const controller = Controller.attach(contracts.controller);

  const GMKToken = await ethers.getContractFactory("GMKToken");
  const uxdToken = GMKToken.attach(contracts.uxd);

  let totalSupply = await uxdToken.totalSupply();
  console.log(`GMK total supply = ${ethers.utils.formatEther(totalSupply)}`);
  console.log("Approving GMK");
  await (await uxdToken.approve(controller.address, uxdAmount)).wait();
  const tx = await (
    await controller.redeem(config.tokens.USDC, uxdAmount, 0, signer.address)
  ).wait();
  console.log(`Redeem tx hash is ${tx.transactionHash}`);

  totalSupply = await uxdToken.totalSupply();
  console.log(`GMK total supply = ${ethers.utils.formatEther(totalSupply)}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
