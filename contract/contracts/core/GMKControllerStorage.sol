// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import {IRedeemable} from "./GMKToken.sol";
import {IGMKRouter} from "./IGMKRouter.sol";

/// @title GMKControllerStorage
/// @notice Base storage contract for GMKController
/// @dev Defines storage layout for the GMKController contract
abstract contract GMKControllerStorage {

    /// @notice The token to be minted and burned
    IRedeemable public redeemable;

    /// @notice The router to the perpetual DEXes.
    IGMKRouter public router;

    /// @notice Mapping for tokens that are whitelisted to be used as collateral.
    /// @dev Mapping token address => is whitelisted
    mapping(address => bool) public whitelistedAssets;

    /// @dev the list of accepted collateral tokens
    address[] public assetList;

    /// token address
    address public lsToken;
}
