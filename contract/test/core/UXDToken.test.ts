import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("GMKToken", function () {
  let token: Contract;
  let controller: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  const globalSupplyCap = ethers.utils.parseEther("1000");

  beforeEach(async () => {
    // deploy XD Token and set controller to first signer
    const signers = await ethers.getSigners();
    [controller, bob, alice] = signers;
    const totalSupply = "0";
    const GMKToken = await ethers.getContractFactory("GMKToken");
    token = await GMKToken.deploy(
      controller.address,
      ethers.constants.AddressZero
    ) as Contract;
    await token.deployed();

    await token.setLocalMintCap(globalSupplyCap);
  });

  it("Can mint tokens", async function () {
    // mints 1000 tokens correctly
    const mintAmount = ethers.utils.parseEther("1000");
    const mintTx = await token
      .connect(controller)
      .mint(bob.address, mintAmount);
    await mintTx.wait();

    // check total supply
    let totalSupply = await token.totalSupply();
    expect(totalSupply).to.equal(mintAmount);

    // check balance is updated
    const bobBalance = await token.balanceOf(bob.address);
    expect(bobBalance).to.equal(totalSupply);
  });

  it("Can burn tokens", async () => {
    // mints 1000 tokens correctly
    const mintAmount = ethers.utils.parseEther("1000");
    await (
      await token.connect(controller).mint(bob.address, mintAmount)
    ).wait();

    const burnAmount = mintAmount.div(2);
    await (
      await token.connect(bob).approve(controller.address, burnAmount)
    ).wait();
    await (
      await token.connect(controller).burn(bob.address, burnAmount)
    ).wait();

    const totalSupply = await token.totalSupply();
    expect(totalSupply).to.equal(mintAmount.sub(burnAmount));

    const bobBalance = await token.balanceOf(bob.address);
    expect(bobBalance).to.equal(mintAmount.sub(burnAmount));
  });

  it("Can transfer tokens", async () => {
    const mintAmount = ethers.utils.parseEther("1000");
    const mintTx = await token
      .connect(controller)
      .mint(bob.address, mintAmount);
    await mintTx.wait();

    const transferAmount = mintAmount.div(4);
    const remainingAmount = mintAmount.sub(transferAmount);

    await (
      await token.connect(bob).transfer(alice.address, transferAmount)
    ).wait();
    // alice balance should be updated
    const aliceBalance = await token.balanceOf(alice.address);
    expect(aliceBalance).to.equal(transferAmount);

    const bobBalance = await token.balanceOf(bob.address);
    expect(bobBalance).to.equal(remainingAmount);
  });

  it("Can approve transfer from another user", async () => {
    const mintAmount = ethers.utils.parseEther("1000");
    const mintTx = await token
      .connect(controller)
      .mint(bob.address, mintAmount);
    await mintTx.wait();

    const transferAmount = mintAmount.div(4);
    const remainingAmount = mintAmount.sub(transferAmount);

    await (
      await token.connect(bob).approve(controller.address, transferAmount)
    ).wait();
    await (
      await token
        .connect(controller)
        .transferFrom(bob.address, alice.address, transferAmount)
    ).wait();

    const aliceBalance = await token.balanceOf(alice.address);
    expect(aliceBalance).to.equal(transferAmount);

    const bobBalance = await token.balanceOf(bob.address);
    expect(bobBalance).to.equal(remainingAmount);
  });

  it("can take a snapshot", async () => {
    // 1. mint tokens
    // 2. send tokens from a -> b
    // 3. take snapshot
    // 4. burn tokens from bob
    // 5. send tokens from b-> a
    // 6. check balances on snapshot match.

    const mintAmount = ethers.utils.parseEther("1000");
    const transferAmount = ethers.utils.parseEther("200");
    const burnAmount = ethers.utils.parseEther("100");

    // 1. mint tokens
    const mintTx = await (
      await token.connect(controller).mint(bob.address, mintAmount)
    ).wait();

    // 2. send tokens from b -> a
    await (
      await token.connect(bob).transfer(alice.address, transferAmount)
    ).wait();

    // 3. take snapshot
    const event = await (await token.takeSnapshot()).wait();
    const shotId = +event["events"][0].data;
    console.log("shotId = ", shotId);

    // 4. burn tokens from bob
    await (
      await token.connect(bob).approve(controller.address, burnAmount)
    ).wait();
    await (
      await token.connect(controller).burn(bob.address, burnAmount)
    ).wait();

    // 5. send tokens from a -> b
    await (
      await token.connect(alice).transfer(bob.address, transferAmount)
    ).wait();

    // 6. check balances on snapshot match.
    const bobCurrentBalance = await token.balanceOf(bob.address);
    const bobSnapshotBalance = await token.balanceOfAt(bob.address, shotId);
    const aliceCurrentBalance = await token.balanceOf(alice.address);
    const aliceSnapshotBalance = await token.balanceOfAt(alice.address, shotId);
    const totalSupplyAtSnapshot = await token.totalSupplyAt(shotId);
    const totalSupplyAtCurrentT1 = await token.totalSupply();

    expect(bobCurrentBalance).to.eq(mintAmount.sub(burnAmount));
    expect(aliceCurrentBalance).to.eq(0);

    expect(bobSnapshotBalance).to.eq(mintAmount.sub(transferAmount));
    expect(aliceSnapshotBalance).to.eq(transferAmount);
    expect(totalSupplyAtSnapshot).to.eq(mintAmount);
    expect(totalSupplyAtCurrentT1).to.eq(mintAmount.sub(burnAmount));
  });
});
