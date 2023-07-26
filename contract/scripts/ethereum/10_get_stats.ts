import { ethers } from "hardhat";
import { loadCoreContracts } from "../common/loaders";

async function main() {
  const hre = await import("hardhat");
  const coreContracts = await loadCoreContracts(hre);

  const GMKToken = await ethers.getContractFactory("GMKToken");
  const token = GMKToken.attach(coreContracts.uxd);

  const totalSupply = await token.totalSupply();
  console.log(`GMK total supply = ${ethers.utils.formatEther(totalSupply)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
