// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import {IRedeemable} from "./GMKToken.sol";

interface IGMKController {

    function redeemable() external returns (IRedeemable);

    function mint(
        address asset,
        uint256 amount,
        uint256 minAmountOut,
        address receiver
    ) external returns (uint256);

    function redeem(
        address asset,
        uint256 redeemAmount,
        uint256 minAssetAmountOut,
        address receiver
    ) external returns (uint256);
}
