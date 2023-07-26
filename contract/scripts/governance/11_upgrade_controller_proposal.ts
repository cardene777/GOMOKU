import { ethers } from "hardhat";
import { UXDController, UXDGovernor } from "../../types";
import {
  loadControllerImpl,
  loadCoreContracts,
  loadCouncilGovernanceContracts,
} from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const core = await loadCoreContracts(hre);
  const governance = await loadCouncilGovernanceContracts(hre);
  const controllerImpl = await loadControllerImpl(hre);

  const UXDGovernor = await ethers.getContractFactory("UXDGovernor");
  const governor = UXDGovernor.attach(governance.governor) as UXDGovernor;

  const UXDController = await ethers.getContractFactory("UXDController");
  const controller = UXDController.attach(core.controller) as UXDController;

  const newImplementation = controllerImpl.controllerImpl;
  const proposalDescription = `23-03-26: Upgrade UXDController implementation`;

  const upgradeCallData = controller.interface.encodeFunctionData("upgradeTo", [
    newImplementation,
  ]);

  console.log("proposing");
  const tx = await (
    await governor.propose(
      [controller.address],
      [0],
      [upgradeCallData],
      proposalDescription
    )
  ).wait();
  console.log("governance tx = ", tx.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
