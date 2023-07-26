import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { UXPToken } from "../../types";

chai.use(solidity);

describe("UXPToken", async () => {
  let uxp: UXPToken;
  let admin: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  const initialSupply = ethers.utils.parseEther("1000");

  beforeEach(async () => {
    [admin, bob, alice] = await ethers.getSigners();
    uxp = (await (
      await ethers.getContractFactory("UXPToken")
    ).deploy(
      admin.address,
      initialSupply,
      ethers.constants.AddressZero
    )) as UXPToken;
  });

  it("can mint", async () => {
    const initialSupply = await uxp.totalSupply();
    const amount = ethers.utils.parseEther("2");
    await (await uxp.mint(bob.address, amount)).wait();
    const bobBalance = await uxp.balanceOf(bob.address);
    expect(bobBalance).to.eq(amount);
    const newSupply = await uxp.totalSupply();
    expect(newSupply).to.eq(initialSupply.add(amount));
  });

  it("can burn", async () => {
    const amount = ethers.utils.parseEther("1");
    const oldBalance = await uxp.balanceOf(admin.address);
    await (await uxp.burn(admin.address, amount)).wait();

    const newBalance = await uxp.balanceOf(admin.address);
    expect(newBalance).to.eq(oldBalance.sub(amount));

    // requires approval to burn from other account
    await (await uxp.mint(bob.address, amount)).wait();
    const bobOldBalance = await uxp.balanceOf(bob.address);
    await expect(uxp.burn(bob.address, amount)).to.be.revertedWith(
      "ERC20: insufficient allowance"
    );
    await (await uxp.connect(bob).approve(admin.address, amount)).wait();
    await (await uxp.burn(bob.address, amount)).wait();
    const bobNewBalance = await uxp.balanceOf(bob.address);
    expect(bobNewBalance).to.eq(bobOldBalance.sub(amount));
  });

  it("can take a snapshot", async () => {
    // 1. send tokens from a -> b
    // 2. take snapshot
    // 3. burn tokens from a
    // 4. send tokens from b-> a
    // 5. check balances on snapshot match.

    const transferAmount = ethers.utils.parseEther("200");
    const burnAmount = ethers.utils.parseEther("100");

    // 1. send tokens from a -> b
    await (await uxp.transfer(bob.address, transferAmount)).wait();

    // 2. take snapshot
    const event = await (await uxp.takeSnapshot()).wait();
    const shotId = +event["events"][0].data;
    console.log("shotId = ", shotId);

    // 3. burn tokens from admin
    await (await uxp.approve(admin.address, burnAmount)).wait();
    await (await uxp.burn(admin.address, burnAmount)).wait();

    // 4. send tokens from b -> a
    await (
      await uxp.connect(bob).transfer(alice.address, transferAmount)
    ).wait();

    // 5. check balances on snapshot match.
    const bobCurrentBalance = await uxp.balanceOf(bob.address);
    const bobSnapshotBalance = await uxp.balanceOfAt(bob.address, shotId);
    const adminCurrentBalance = await uxp.balanceOf(admin.address);
    const adminSnapshotBalance = await uxp.balanceOfAt(admin.address, shotId);
    const totalSupplyAtSnapshot = await uxp.totalSupplyAt(shotId);
    const totalSupplyAtCurrentT1 = await uxp.totalSupply();

    expect(bobCurrentBalance).to.eq(0);
    expect(adminCurrentBalance).to.eq(
      initialSupply.sub(transferAmount).sub(burnAmount)
    );

    expect(bobSnapshotBalance).to.eq(transferAmount);
    expect(adminSnapshotBalance).to.eq(initialSupply.sub(transferAmount));
    expect(totalSupplyAtSnapshot).to.eq(initialSupply);
    expect(totalSupplyAtCurrentT1).to.eq(initialSupply.sub(burnAmount));
  });
});
