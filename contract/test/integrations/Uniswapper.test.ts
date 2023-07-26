import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { ERC20, MockUniswapRouter, Uniswapper } from "../../types";

chai.use(solidity);

describe("Uniswapper", async () => {
  let swapRouter: MockUniswapRouter;
  let swapper: Uniswapper;
  let tokenIn: ERC20;
  let tokenOut: ERC20;

  beforeEach(async () => {
    swapRouter = (await (
      await ethers.getContractFactory("MockUniswapRouter")
    ).deploy()) as MockUniswapRouter;
    swapper = (await (
      await ethers.getContractFactory("Uniswapper")
    ).deploy(swapRouter.address)) as Uniswapper;
    tokenIn = (await (
      await ethers.getContractFactory("TestERC20")
    ).deploy("Token In", "IN", 18)) as ERC20;
    tokenOut = (await (
      await ethers.getContractFactory("TestERC20")
    ).deploy("Token Out", "Out", 18)) as ERC20;
  });

  it("can swap exact input", async () => {
    const amountIn = ethers.utils.parseEther("10");
    const amountOut = ethers.utils.parseEther("1");
    const swapParams = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      amountIn: amountIn,
      amountOutMinimum: amountOut,
      sqrtPriceLimitX96: 0,
      poolFee: 0,
    };
    await (await tokenIn.approve(swapper.address, amountIn)).wait();
    expect(await swapper.swapExactInput(swapParams)).to.emit(
      tokenIn,
      "Transfer"
    );
    const swapRouterAllowance = await tokenIn.allowance(
      swapper.address,
      swapRouter.address
    );
    expect(swapRouterAllowance).to.eq(amountIn);
  });
});
