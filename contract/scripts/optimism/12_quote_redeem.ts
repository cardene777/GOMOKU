import bn from "bignumber.js";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { OptimismConfig } from "../../config/configs";
import { loadConfig, loadCoreContracts } from "../common/loaders";

let tx;

async function main() {
  console.log(">>> Redeem USDC and burn GMK");
  const hre = await import("hardhat");
  const config = (await loadConfig(hre)) as OptimismConfig;
  const coreContracts = await loadCoreContracts(hre);
  const Controller = await ethers.getContractFactory("GMKController");
  const controller = Controller.attach(coreContracts.controller);

  const GMK = await ethers.getContractFactory("GMKToken");
  const uxdToken = GMK.attach(coreContracts.uxd);
  let uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));

  const uxdAmount = ethers.utils.parseEther("150.0");
  console.log("Approving GMK");
  await (await uxdToken.approve(controller.address, uxdAmount)).wait();

  // // redeem WETH
  tx = await controller.redeem(
    config.tokens.USDC,
    uxdAmount,
    0,
    config.addresses.TokenReceiver
  );

  await tx.wait();
  console.log("redeem tx = ", tx.hash);

  uxdTotalSupply = await uxdToken.totalSupply();
  console.log("GMK total supply = ", ethers.utils.formatEther(uxdTotalSupply));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 18 });

// computes the squre root of the price according to the uniswap formula
// https://docs.uniswap.org/sdk/guides/fetching-prices#understanding-sqrtprice
export function encodePriceSqrt(price: string | number): BigNumber {
  return BigNumber.from(
    new bn(price)
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}
