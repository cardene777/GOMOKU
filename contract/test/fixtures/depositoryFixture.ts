import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import {
  MockController,
  MockPerpAccountBalance,
  MockPerpClearingHouse,
  MockPerpVault,
  MockRageSeniorVault,
  PerpDepository,
  RageDnDepository,
} from "../../types";
import { ContractFactory } from "ethers";

export async function deployPerpDepositoryFixture() {
  const signers = await ethers.getSigners();
  let admin: SignerWithAddress;
  [admin] = signers;

  const TestERC20 = await ethers.getContractFactory("TestERC20");

  let redeemable = await TestERC20.deploy("Redeemable", "RED", 18);
  await redeemable.deployed();

  let controller = (await (
    await ethers.getContractFactory("MockController")
  ).deploy()) as MockController;
  await (await controller.setRedeemable(redeemable.address)).wait();

  const Vault = await ethers.getContractFactory("MockPerpVault");
  let vault = (await Vault.deploy()) as MockPerpVault;
  await vault.deployed();

  const AccountBalance = await ethers.getContractFactory(
    "MockPerpAccountBalance"
  );
  let accountBalance = (await AccountBalance.deploy(
    vault.address
  )) as MockPerpAccountBalance;
  await accountBalance.deployed();

  const Exchange = await ethers.getContractFactory("MockPerpExchange");
  let mockPerpExchange = await Exchange.deploy();
  await mockPerpExchange.deployed();

  const ClearingHouse = await ethers.getContractFactory(
    "MockPerpClearingHouse"
  );
  let clearingHouse = (await ClearingHouse.deploy()) as MockPerpClearingHouse;
  await clearingHouse.deployed();

  await (await clearingHouse.setAccountBalance(accountBalance.address)).wait();
  await (await clearingHouse.setExchange(mockPerpExchange.address)).wait();

  const MarketRegistry = await ethers.getContractFactory(
    "MockPerpMarketRegistry"
  );
  const marketRegistry = await MarketRegistry.deploy();
  await marketRegistry.deployed();

  const DelegateApproval = await ethers.getContractFactory(
    "MockPerpDelegateApproval"
  );
  const delegateApproval = await DelegateApproval.deploy();
  await delegateApproval.deployed();

  const TestContract = await ethers.getContractFactory("TestContract");
  const market = await TestContract.deploy();
  await market.deployed();

  const quoteDecimals = 6;
  let quoteToken = await TestERC20.deploy("Quote", "QTE", quoteDecimals);
  await quoteToken.deployed();

  let baseToken = await TestERC20.deploy("Collateral", "COL", 18);
  await baseToken.deployed();

  const Depository = await ethers.getContractFactory("PerpDepository");
  let depository = (await upgrades.deployProxy(
    Depository as ContractFactory,
    [
      vault.address,
      clearingHouse.address,
      marketRegistry.address,
      delegateApproval.address,
      market.address,
      baseToken.address,
      quoteToken.address,
      controller.address,
    ],
    { kind: "uups" }
  )) as PerpDepository;
  await depository.deployed();

  await (await controller.updateDepository(depository.address)).wait();
  await (
    await depository.setRedeemableSoftCap(ethers.utils.parseEther("1000000"))
  ).wait();

  return {
    controller,
    vault,
    depository,
    quoteToken,
    baseToken,
    accountBalance,
    mockPerpExchange,
    quoteDecimals,
    market,
  };
}

export async function deployRageDnDepositoryFixture() {
  const TestERC20 = await ethers.getContractFactory("TestERC20");

  const assetDecimals = 6;
  let assetToken = await TestERC20.deploy("Asset", "ASS", assetDecimals);
  await assetToken.deployed();
  let redeemable = await TestERC20.deploy("Redeemable", "RED", 18);
  await redeemable.deployed();

  let vault = (await (
    await ethers.getContractFactory("MockRageSeniorVault")
  ).deploy()) as MockRageSeniorVault;
  await (await vault.initialize(assetToken.address)).wait();
  let controller = await (
    await ethers.getContractFactory("MockController")
  ).deploy();
  await (await controller.setRedeemable(redeemable.address)).wait();
  const Depository = await ethers.getContractFactory("RageDnDepository");
  let depository = (await upgrades.deployProxy(
    Depository as ContractFactory,
    [vault.address, controller.address],
    { kind: "uups" }
  )) as RageDnDepository;
  await depository.deployed();

  await (await vault.setDepository(depository.address)).wait();
  await (await controller.updateDepository(depository.address)).wait();
  await (
    await depository.setRedeemableSoftCap(ethers.utils.parseEther("1000000"))
  ).wait();

  return {
    controller,
    vault,
    depository,
    assetToken,
    assetDecimals,
  };
}
