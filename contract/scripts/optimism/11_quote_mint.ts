import { ethers } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { Depositories } from "../../config/contracts";
import {
  loadConfig,
  loadCoreContracts,
  loadDepositories,
} from "../common/loaders";

let tx;
const usdcDecimals = 6;

async function main() {
  const hre = await import("hardhat");
  const config = (await loadConfig(hre)) as OptimismConfig;
  const coreContracts = await loadCoreContracts(hre);
  const depositories = (await loadDepositories(hre)) as Depositories;

  console.log(">>> Mint GMK with USDC");
  const Controller = await ethers.getContractFactory("GMKController");
  const controller = Controller.attach(coreContracts.controller);

  const PerpDepository = await ethers.getContractFactory("PerpDepository");
  const depository = PerpDepository.attach(depositories.perpetualProtocol!);

  const GMK = await ethers.getContractFactory("GMKToken");
  const uxdToken = GMK.attach(coreContracts.uxd);

  const ERC20 = await ethers.getContractFactory("TestERC20");
  const USDC = ERC20.attach(config.tokens.USDC);

  console.log("***USDC address is ", USDC.address);
  const usdcAmount = ethers.utils.parseUnits("1.00", usdcDecimals);

  console.log("approving USDC");
  tx = await USDC.approve(controller.address, usdcAmount);
  await tx.wait();

  let positionPnl = await depository.getUnrealizedPnl();
  console.log("Pnl before = ", ethers.utils.formatEther(positionPnl));

  let uxdTotalSupply = await uxdToken.totalSupply();
  console.log(
    "GMK total supply before = ",
    ethers.utils.formatEther(uxdTotalSupply)
  );

  console.log("minting with quote token");
  tx = await controller.mint(
    USDC.address,
    usdcAmount,
    0,
    config.addresses.TokenReceiver
  );
  console.log("mint with quote tx = ", tx.hash);
  await tx.wait();

  uxdTotalSupply = await uxdToken.totalSupply();
  console.log(
    "GMK total supply after = ",
    ethers.utils.formatEther(uxdTotalSupply)
  );

  positionPnl = await depository.getUnrealizedPnl();
  console.log("Pnl after = ", ethers.utils.formatEther(positionPnl));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
