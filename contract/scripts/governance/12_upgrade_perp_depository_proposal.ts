import { ethers } from "hardhat";
import { UXDGovernor } from "../../types";
import {
  loadCoreContracts,
  loadCouncilGovernanceContracts,
  loadDepositories,
  loadPerpDepositoryImpl,
} from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const core = await loadCoreContracts(hre);
  const governance = await loadCouncilGovernanceContracts(hre);
  const depositoryImpl = await loadPerpDepositoryImpl(hre);
  const depositories = await loadDepositories(hre);

  const UXDGovernor = await ethers.getContractFactory("UXDGovernor");
  const governor: UXDGovernor = UXDGovernor.attach(
    governance.governor
  ) as UXDGovernor;

  const PerpDepository = await ethers.getContractFactory("PerpDepository");
  const perpDepository = PerpDepository.attach(depositories.perpetualProtocol!);

  const newImplementation = depositoryImpl.depositoryImpl;
  const proposalDescription = `Upgrade PerpDepository implementation`;

  const upgradeCallData = perpDepository.interface.encodeFunctionData(
    "upgradeTo",
    [newImplementation]
  );

  console.log("proposing");
  const tx = await (
    await governor.propose(
      [perpDepository.address],
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
