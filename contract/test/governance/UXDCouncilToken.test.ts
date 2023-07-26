import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { UXDCouncilToken } from "../../types";

chai.use(solidity);

describe("UXDCouncilToken", async () => {
  let councilToken: UXDCouncilToken;
  let admin: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;

  beforeEach(async () => {
    [admin, bob, alice] = await ethers.getSigners();
    councilToken = (await (
      await ethers.getContractFactory("UXDCouncilToken")
    ).deploy(admin.address)) as UXDCouncilToken;
  });

  it("can mint", async () => {
    const initialSupply = await councilToken.totalSupply();
    const amount = ethers.utils.parseEther("2");
    await (await councilToken.mint(bob.address, amount)).wait();
    const bobBalance = await councilToken.balanceOf(bob.address);
    expect(bobBalance).to.eq(amount);
    const newSupply = await councilToken.totalSupply();
    expect(newSupply).to.eq(initialSupply.add(amount));
  });

  it("can burn", async () => {
    const amount = ethers.utils.parseEther("1");
    const oldBalance = await councilToken.balanceOf(admin.address);
    await (await councilToken.burn(amount)).wait();
    const newBalance = await councilToken.balanceOf(admin.address);
    expect(newBalance).to.eq(oldBalance.sub(amount));
  });

  it("owner can burn from another address", async () => {
    const amount = ethers.utils.parseEther("1");
    await (await councilToken.mint(alice.address, amount)).wait();
    let aliceBalance = await councilToken.balanceOf(alice.address);
    expect(aliceBalance).to.eq(amount);

    // other user can not burnFrom
    await expect(councilToken.connect(bob).burnFrom(alice.address, amount)).to
      .be.reverted;
    aliceBalance = await councilToken.balanceOf(alice.address);
    expect(aliceBalance).to.eq(amount);

    // admin can burn from
    await (await councilToken.burnFrom(alice.address, amount)).wait();
    aliceBalance = await councilToken.balanceOf(alice.address);
    expect(aliceBalance).to.eq(0);
  });
});
