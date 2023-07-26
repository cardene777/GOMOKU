import { ethers } from "hardhat";
import { UXDCouncilToken, UXDGovernor } from "../../types";
import { loadCouncilGovernanceContracts } from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const governance = await loadCouncilGovernanceContracts(hre);
  const UXDCouncilToken = await ethers.getContractFactory("UXDCouncilToken");
  const councilToken = UXDCouncilToken.attach(
    governance.token
  ) as UXDCouncilToken;

  const UXDGovernor = await ethers.getContractFactory("UXDGovernor");
  const governor = UXDGovernor.attach(governance.governor) as UXDGovernor;

  const tokenRecipient1 = "0x864aA619294E9Eb4F5Ad2bFdA2f1B815a93B5B60";
  const tokenRecipient2 = "0x6Dc8b2A8f35FAFAED3d5501163dCfC51Acc49F7d";
  const tokenRecipient3 = "0x20f8D02a4E300e30F50Ac897370F6a89691Bd3c8";
  const tokenRecipient4 = "0xA25cC81223139032E127855eB7Eaa00a22bAF533";
  const tokenRecipient5 = "0x040B2f2DB9923f40B7c5B72b70cC975285d8E28E";
  // const tokenRecipient6 = "0xd2F980378333F349240301D92fe04ac6DBefB86a";
  const proposalDescription = `23-06-24: Mint Council tokens to team`;

  const amount = ethers.utils.parseEther("1");

  const mintCallData1 = councilToken.interface.encodeFunctionData("mint", [
    tokenRecipient1,
    amount,
  ]);
  const mintCallData2 = councilToken.interface.encodeFunctionData("mint", [
    tokenRecipient2,
    amount,
  ]);
  const mintCallData3 = councilToken.interface.encodeFunctionData("mint", [
    tokenRecipient3,
    amount,
  ]);
  const mintCallData4 = councilToken.interface.encodeFunctionData("mint", [
    tokenRecipient4,
    amount,
  ]);
  const mintCallData5 = councilToken.interface.encodeFunctionData("mint", [
    tokenRecipient5,
    amount,
  ]);
  // const mintCallData6 = councilToken.interface.encodeFunctionData("mint", [tokenRecipient6]);

  console.log("proposing");
  const contract = councilToken.address;
  const tx = await (
    await governor.propose(
      [contract, contract, contract, contract, contract],
      [0, 0, 0, 0, 0],
      [
        mintCallData1,
        mintCallData2,
        mintCallData3,
        mintCallData4,
        mintCallData5,
      ],
      proposalDescription
    )
  ).wait();
  console.log("governance tx = ", tx.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
