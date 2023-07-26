import { expect } from "chai";
import type { ContractFactory } from "ethers";
import { ethers, upgrades } from "hardhat";
import { GMKController__factory } from "../../types";

describe("GMKController upgrade", () => {
  it("Can upgrade successfully", async () => {
    const ERC20 = await ethers.getContractFactory("TestERC20");
    const token = await ERC20.deploy("TestERC20", "MyToken", 18);
    await token.deployed();

    // deploy initial contract
    const GMKController = (await ethers.getContractFactory(
      "GMKController"
    )) as GMKController__factory;

    const instance = await upgrades.deployProxy(
      GMKController as ContractFactory,
      [token.address],
      { kind: "uups" }
    );

    expect(await instance.VERSION()).to.equal(1);

    // upgrade to new version
    const UpgradedGMKController = await ethers.getContractFactory(
      "TestGMKControllerUpgrade"
    );
    const upgraded = await upgrades.upgradeProxy(
      instance.address,
      UpgradedGMKController as ContractFactory
    );
    expect(instance.address).to.equal(upgraded.address);
    expect(await upgraded.VERSION()).to.equal(2);
  });
});
