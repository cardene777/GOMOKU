import { ethers } from "hardhat";
import { UXDGovernor } from "../../types";
import {
  loadCoreContracts,
  loadCouncilGovernanceContracts,
  loadDepositories,
  loadRageDepositoryImpl,
} from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const core = await loadCoreContracts(hre);
  const governance = await loadCouncilGovernanceContracts(hre);
  const depositories = await loadDepositories(hre);
  const depositoryImpl = await loadRageDepositoryImpl(hre);

  const UXDGovernor = await ethers.getContractFactory("UXDGovernor");
  const governor: UXDGovernor = UXDGovernor.attach(
    governance.governor
  ) as UXDGovernor;

  const RageDepository = await ethers.getContractFactory("RageDnDepository");
  const rageDepository = RageDepository.attach(depositories.rageTrade!);

  const newImplementation = depositoryImpl.depositoryImpl;
  const proposalDescription = `23-03-26: Upgrade RageDepository implementation`;

  const upgradeCallData = rageDepository.interface.encodeFunctionData(
    "upgradeTo",
    [newImplementation]
  );

  console.log("proposing");
  const tx = await (
    await governor.propose(
      [rageDepository.address],
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
