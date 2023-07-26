import { ethers } from "hardhat";
import { UXDGovernor, UXDTimelockController } from "../../types";
import {
  loadConfig,
  loadCoreContracts,
  loadCouncilGovernanceContracts,
} from "../common/loaders";

async function main() {
  const hre = await import("hardhat");

  const config = await loadConfig(hre);
  const core = await loadCoreContracts(hre);
  const councilGovernance = await loadCouncilGovernanceContracts(hre);

  const UXDGovernor = await ethers.getContractFactory("UXDGovernor");
  const governor: UXDGovernor = UXDGovernor.attach(
    councilGovernance.governor
  ) as UXDGovernor;

  const Controller = await ethers.getContractFactory("UXDController");
  const controller = Controller.attach(core.controller);

  const UXDTimelock = await ethers.getContractFactory("UXDTimelockController");
  const timelock = UXDTimelock.attach(
    councilGovernance.timelock
  ) as UXDTimelockController;

  const usdcAmount = ethers.utils.parseUnits("250000.0", 6);
  const minAmountOut = ethers.utils.parseEther("250000");
  const spender = controller.address;

  const approveCallData = timelock.interface.encodeFunctionData(
    "approveERC20",
    [config.tokens.USDC, spender, usdcAmount]
  );
  const mintCallData = controller.interface.encodeFunctionData("mint", [
    config.tokens.USDC,
    usdcAmount,
    minAmountOut,
    timelock.address,
  ]);

  const proposalDescription = `2023-04-02: Mint 250,000 UXD tokens`;

  console.log("proposing");
  const tx = await (
    await governor.propose(
      [timelock.address, controller.address],
      [0, 0],
      [approveCallData, mintCallData],
      proposalDescription
    )
  ).wait();
  console.log("Proposal tx = ", tx.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
