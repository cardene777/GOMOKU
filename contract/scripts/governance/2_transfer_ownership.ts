import { ethers } from "hardhat";
import {
  IDepository,
  PerpDepository,
  RageDnDepository,
  UXDController,
  UXDCouncilToken,
  UXDRouter,
  UXDToken,
} from "../../types";
import { NetworkName } from "../common/checkNetwork";
import {
  loadCoreContracts,
  loadCouncilGovernanceContracts,
  loadDepositories,
} from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const coreContracts = await loadCoreContracts(hre);
  // const governancePublic = await loadPublicGovernanceContracts(hre);
  const governanceCouncil = await loadCouncilGovernanceContracts(hre);
  const depositories = await loadDepositories(hre);

  const UXDController = await ethers.getContractFactory("UXDController");
  const controller = UXDController.attach(
    coreContracts.controller
  ) as UXDController;

  const UXDRouter = await ethers.getContractFactory("UXDRouter");
  const router = UXDRouter.attach(coreContracts.router) as UXDRouter;

  const UXDToken = await ethers.getContractFactory("UXDToken");
  const uxdToken = UXDToken.attach(coreContracts.uxd) as UXDToken;

  let depository: IDepository | undefined;
  const networkName = hre.network.name || "";
  switch (networkName) {
    case NetworkName.OptimismGoerli:
    case NetworkName.Optimism:
      const PerpDepository = await ethers.getContractFactory("PerpDepository");
      if (depositories) {
        depository = PerpDepository.attach(
          depositories.perpetualProtocol!
        ) as PerpDepository;
      }
      break;
    case NetworkName.ArbitrumGoerli:
    case NetworkName.ArbitrumOne:
      if (depositories) {
        const RageDnDepository = await ethers.getContractFactory(
          "RageDnDepository"
        );
        depository = RageDnDepository.attach(
          depositories.rageTrade!
        ) as RageDnDepository;
      }
      break;
    default:
      break;
  }

  const CouncilToken = await ethers.getContractFactory("UXDCouncilToken");
  const councilToken = CouncilToken.attach(
    governanceCouncil.token
  ) as UXDCouncilToken;
  // const UXPToken = await ethers.getContractFactory("UXPToken");
  // const uxpToken = UXPToken.attach(governancePublic.token) as UXPToken;

  console.log("Transferring controller ownership");
  let tx = await (
    await controller.transferOwnership(governanceCouncil.timelock)
  ).wait();
  console.log("Controller ownership transferred: ", tx.transactionHash);

  console.log("Transferring rotuer ownership");
  tx = await (
    await router.transferOwnership(governanceCouncil.timelock)
  ).wait();
  console.log("Router ownership transferred: ", tx.transactionHash);

  console.log("Transferring UXD token ownership");
  tx = await (
    await uxdToken.transferOwnership(governanceCouncil.timelock)
  ).wait();
  console.log("UXD token ownership transferred: ", tx.transactionHash);

  if (depository !== undefined) {
    // on ETH
    console.log("Transferring depository ownership");
    tx = await (
      await depository.transferOwnership(governanceCouncil.timelock)
    ).wait();
    console.log("Depository ownership transferred: ", tx.transactionHash);
  }

  console.log("Transferring council token ownership");
  tx = await (
    await councilToken.transferOwnership(governanceCouncil.timelock)
  ).wait();
  console.log("Council token ownership transferred: ", tx.transactionHash);

  // console.log('Transferring UXP token ownership');
  // tx = await (await uxpToken.transferOwnership(governanceCouncil.timelock)).wait();
  // console.log('UXP token ownership transferred: ', tx.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
