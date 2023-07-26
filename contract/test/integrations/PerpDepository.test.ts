import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import bn from "bignumber.js";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DepositoryStateStruct } from "../../types/contracts/test/TestPerpDepositoryUpgrade";
import { deployPerpDepositoryFixture } from "../fixtures/depositoryFixture";

chai.use(solidity);

describe("PerpDepository", async () => {
  let admin: SignerWithAddress;
  let bob: SignerWithAddress;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    [admin, bob] = signers;
  });

  it("has the right version", async () => {
    const { depository } = await loadFixture(deployPerpDepositoryFixture);
    const version = await depository.VERSION();
    expect(version).to.eq(1);
  });

  it("has an initial state", async () => {
    const { depository, vault, quoteToken } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const owner = await depository.owner();
    expect(owner).to.eq(admin.address);
    const freeCollateral = await depository.getFreeCollateral();
    expect(freeCollateral).to.eq(0);
    const markPriceTwap = await depository.getMarkPriceTwap(0);
    const exchangeFee = await depository.getExchangeFeeWad();
  });

  it("can deposit insurance", async () => {
    const { depository, vault, quoteToken, quoteDecimals } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const insuranceAmount = ethers.utils.parseUnits("1", quoteDecimals);
    await (
      await quoteToken.approve(depository.address, insuranceAmount)
    ).wait();
    await (
      await depository.depositInsurance(insuranceAmount, admin.address)
    ).wait();
    const depositoryBalance = await quoteToken.balanceOf(vault.address);
    const insuranceDeposited = await depository.insuranceDeposited();

    expect(depositoryBalance).to.equal(insuranceAmount);
    expect(insuranceDeposited).to.equal(insuranceAmount);
  });

  it("can withdraw insurance", async () => {
    const { depository, vault, quoteToken, quoteDecimals } = await loadFixture(
      deployPerpDepositoryFixture
    );

    const insuranceAmount = ethers.utils.parseUnits("1", quoteDecimals);
    await (
      await quoteToken.approve(depository.address, insuranceAmount)
    ).wait();
    const insuranceDepositedBefore = await depository.insuranceDeposited();

    await (
      await depository.depositInsurance(insuranceAmount, admin.address)
    ).wait();
    await (
      await depository.withdrawInsurance(insuranceAmount, bob.address)
    ).wait();

    const bobBalance = await quoteToken.balanceOf(bob.address);
    const insuranceDepositedAfter = await depository.insuranceDeposited();

    expect(insuranceDepositedBefore).to.equal(insuranceDepositedAfter);
    expect(bobBalance).to.equal(insuranceAmount);
  });

  it("can deposit", async () => {
    const { depository, controller, vault, baseToken } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const collateralAmount = ethers.utils.parseEther("1");
    await (
      await baseToken.transfer(depository.address, collateralAmount)
    ).wait();
    await (
      await controller.deposit(baseToken.address, collateralAmount)
    ).wait();

    const depositoryBalance = await baseToken.balanceOf(vault.address);
    const collateralDeposited = await depository.netAssetDeposits();

    const accountValue = await depository.getAccountValue();
    expect(accountValue).to.not.eq(0);

    expect(depositoryBalance).to.equal(collateralAmount);
    expect(collateralDeposited).to.equal(collateralAmount);
  });

  it("can withdraw collateral", async () => {
    const { depository, controller, vault, baseToken } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const collateralAmount = ethers.utils.parseEther("1");

    const vaultBaseBalanceBefore = await baseToken.balanceOf(vault.address);
    const collateralDepositedBefore = await depository.netAssetDeposits();

    await (
      await baseToken.transfer(depository.address, collateralAmount)
    ).wait();
    await (
      await controller.deposit(baseToken.address, collateralAmount)
    ).wait();
    await (
      await controller.withdraw(
        baseToken.address,
        collateralAmount,
        bob.address
      )
    ).wait();

    const vaultBaseBalanceAfter = await baseToken.balanceOf(vault.address);
    const bobBalance = await baseToken.balanceOf(bob.address);
    const collateralDepositedAfter = await depository.netAssetDeposits();

    expect(vaultBaseBalanceBefore).to.equal(vaultBaseBalanceAfter);
    expect(collateralDepositedBefore).to.equal(collateralDepositedAfter);
    expect(bobBalance).to.equal(collateralAmount);
  });

  it("Can set redeemable soft cap", async () => {
    const { depository, controller, baseToken } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const amount = ethers.utils.parseEther("100.0");
    const softCap = ethers.utils.parseEther("10");
    await (await baseToken.transfer(depository.address, amount)).wait();
    await (await depository.setRedeemableSoftCap(softCap)).wait();
    await expect(controller.deposit(baseToken.address, amount)).to.be.reverted;
  });

  it("can transfer ownership", async () => {
    const { depository } = await loadFixture(deployPerpDepositoryFixture);
    const owner = await depository.owner();
    expect(owner).to.eq(admin.address);
    await (await depository.transferOwnership(bob.address)).wait();
    let newOwner = await depository.owner();
    expect(newOwner).to.eq(bob.address);

    await (
      await depository.connect(bob).transferOwnership(admin.address)
    ).wait();
  });

  it("has a fee", async () => {
    const { depository } = await loadFixture(deployPerpDepositoryFixture);
    const fee = await depository.getExchangeFee();
    expect(fee).to.not.eq(0);
  });

  it("can get the debt value", async () => {
    const { depository, vault } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const tokenValue = ethers.utils.parseEther("1000");
    await (
      await vault.setSettlementTokenValue(
        depository.address,
        tokenValue.mul(-1)
      )
    ).wait();
    const debtValue = await depository.getDebtValue(depository.address);
    expect(debtValue).to.not.eq(0);
    expect(debtValue).to.eq(tokenValue);
  });

  it("has a current state", async () => {
    const { depository, controller, baseToken } = await loadFixture(
      deployPerpDepositoryFixture
    );
    const assetAmount = ethers.utils.parseEther("1");
    const redeemableSoftCap = ethers.utils.parseEther("10000");
    const redeemableUnderManagement = ethers.utils.parseEther("1");

    await (await depository.setRedeemableSoftCap(redeemableSoftCap)).wait();
    await (await baseToken.transfer(depository.address, assetAmount)).wait();
    await (await controller.deposit(baseToken.address, assetAmount)).wait();

    const state: DepositoryStateStruct = await depository.getCurrentState();
    expect(state.redeemableSoftCap).to.eq(redeemableSoftCap);
  });

  // test quote mint and redeem
  // 1. quote mint fails if no negative pnl
  // 2. quote redeem fails if no positive pnl
  // 3. set negative pnl
  // 4. quote mint succeeds
  // 5. change price to set positive pnl
  // 6. quote redeem succeeds
  // 7. pnl now 0 again, quote mint fails
  // 8. quote redeem fails with no pnl
  it("can quote mint and redeem", async () => {
    const {
      depository,
      controller,
      baseToken,
      mockPerpExchange,
      accountBalance,
      quoteToken,
      quoteDecimals,
      market,
    } = await loadFixture(deployPerpDepositoryFixture);

    const quoteAmount = ethers.utils.parseUnits("5000", quoteDecimals);
    const baseAmount = ethers.utils.parseEther("10");
    const price = BigNumber.from("10");

    // 1. quote mint reverts if no Pnl
    await expect(
      controller.deposit(quoteToken.address, quoteAmount)
    ).to.be.revertedWith("InsufficientPnl");
    // 2. quote redeem reverts if no Pnl
    await expect(
      controller.withdraw(quoteToken.address, quoteAmount, bob.address)
    ).to.be.revertedWith("InsufficientPnl");

    // 3. deposit base token and set negative Pnl
    await (await baseToken.transfer(depository.address, baseAmount)).wait();
    await (await controller.deposit(baseToken.address, baseAmount)).wait();
    await (
      await accountBalance.setTakerPositionSize(
        depository.address,
        market.address,
        ethers.utils.parseEther("1000")
      )
    ).wait();
    await (
      await mockPerpExchange.setSqrtMarkTwapX96(
        market.address,
        sqrtPriceX96(price)
      )
    ).wait();

    // check negative pnl
    let pnlAfterBaseDeposit = await depository.getUnrealizedPnl();

    // 4. quote mint by depositing quote token
    await (await quoteToken.transfer(depository.address, quoteAmount)).wait();
    await (await controller.deposit(quoteToken.address, quoteAmount)).wait();
    // pnl now -8000 + 5000 = -3000

    let pnlAfterQuoteDeposit = await depository.getUnrealizedPnl();
    console.log(
      "Pnl after quote deposit = ",
      ethers.utils.formatEther(pnlAfterQuoteDeposit)
    );
    expect(pnlAfterQuoteDeposit).to.eq(
      pnlAfterBaseDeposit.add(quoteAmount.mul(BigNumber.from(10).pow(12)))
    );

    // 5. change price to set positive pnl
    const newPrice = BigNumber.from("8");
    await (
      await mockPerpExchange.setSqrtMarkTwapX96(
        market.address,
        sqrtPriceX96(newPrice)
      )
    ).wait();
    // after price change to 8, pnl now +2000
    let pnlAfterPriceChange = await depository.getUnrealizedPnl();
    console.log(
      "Pnl after price change = ",
      ethers.utils.formatEther(pnlAfterPriceChange)
    );

    // 6. quote redeem succeeds
    const redeemableAmount = ethers.utils.parseEther("2000");
    await (
      await controller.withdraw(
        quoteToken.address,
        redeemableAmount,
        bob.address
      )
    ).wait();
    let pnlAfterPriceWithdraw = await depository.getUnrealizedPnl();
    console.log(
      "Pnl after price change = ",
      ethers.utils.formatEther(pnlAfterPriceWithdraw)
    );
    expect(pnlAfterPriceWithdraw).to.eq(0);

    // 7. quote mint reverts if no Pnl
    await expect(
      controller.deposit(quoteToken.address, quoteAmount)
    ).to.be.revertedWith("InsufficientPnl");
    // 8. quote redeem reverts if no Pnl
    await expect(
      controller.withdraw(quoteToken.address, quoteAmount, bob.address)
    ).to.be.revertedWith("InsufficientPnl");
  });

  it("has the correct position value", async () => {
    const {
      depository,
      controller,
      baseToken,
      mockPerpExchange,
      accountBalance,
      market,
    } = await loadFixture(deployPerpDepositoryFixture);
    const positionValue = await depository.getPositionValue();
    expect(positionValue).to.eq(0);

    const baseAmount = ethers.utils.parseEther("10");
    const price = BigNumber.from("1");
    await (
      await mockPerpExchange.setSqrtMarkTwapX96(
        market.address,
        sqrtPriceX96(price)
      )
    ).wait();
    await (
      await accountBalance.setTakerPositionSize(
        depository.address,
        market.address,
        baseAmount
      )
    ).wait();

    const markPrice = await depository.getMarkPriceTwap(900);
    await (await baseToken.transfer(depository.address, baseAmount)).wait();
    await (await controller.deposit(baseToken.address, baseAmount)).wait();
    const newPositionValue = await depository.getPositionValue();
    expect(newPositionValue).to.eq(price.mul(baseAmount));
  });
});

function sqrt(value: BigNumber): BigNumber {
  return BigNumber.from(
    new bn(value.toString()).sqrt().toFixed().split(".")[0]
  );
}

function sqrtPriceX96(value: BigNumber): BigNumber {
  // sqrtPriceX96 = sqrt(price) * 2 ** 96
  return sqrt(value).mul(BigNumber.from(2).pow(96));
}

function sqrtToPrice(value: BigNumber): BigNumber {
  // price = sqrtPrice ** 2 / 2 ** 192
  return value.pow(2).div(BigNumber.from(2).pow(192));
}
