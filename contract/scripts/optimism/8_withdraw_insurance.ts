import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { Depositories } from "../../config/contracts";
import { PerpDepository } from "../../types";
import {
  loadConfig,
  loadCoreContracts,
  loadDepositories,
} from "../common/loaders";

let bob: SignerWithAddress;
let admin: SignerWithAddress;
let tx;
const usdcDecimals = 6;

async function main() {
  const hre = await import("hardhat");
  const signers = await ethers.getSigners();
  const config = (await loadConfig(hre)) as OptimismConfig;
  const coreContracts = await loadCoreContracts(hre);
  [admin, bob] = signers;

  const depositories = (await loadDepositories(hre)) as Depositories;
  const Depository = await ethers.getContractFactory("PerpDepository");
  const depository = Depository.attach(
    depositories.perpetualProtocol!
  ) as PerpDepository;

  const usdcAmount = ethers.utils.parseUnits("10", usdcDecimals);
  const receiver = config.addresses.Deployer;
  // withdraw USDC insurance
  console.log("withdrawing USDC to ", receiver);
  tx = await depository.withdrawInsurance(usdcAmount, receiver);
  await tx.wait();
  console.log("withdrawInsurance tx = ", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
