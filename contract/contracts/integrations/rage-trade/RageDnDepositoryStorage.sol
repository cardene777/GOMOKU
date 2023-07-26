// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import {IDnGmxSeniorVault} from "../../external/rage-trade/IDnGmxSeniorVault.sol";
import {IGMKController} from "../../core/IGMKController.sol";
import {IDepository} from "../IDepository.sol";

abstract contract RageDnDepositoryStorage is IDepository {

    /// @dev Rage senior vault address
    IDnGmxSeniorVault public vault;

    /// @dev GMKController address
    IGMKController public controller;

    /// @dev The asset backing managed by this depository
    address public assetToken;

    /// @dev The redeemable managed by this depository
    address public redeemable;

    /// @dev Max amount of redeemable depository can manage
    uint256 public redeemableSoftCap;

    /// @dev Amount that can be redeemed. In redeemable decimals
    uint256 public redeemableUnderManagement;

    /// @dev Total amount deposited - amount withdrawn. In assetToken decimals
    uint256 public netAssetDeposits;

    /// @dev PnL that has be claimed/withdrawn
    uint256 public realizedPnl;
}
