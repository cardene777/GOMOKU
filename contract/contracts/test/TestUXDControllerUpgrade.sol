// SPDX-License-Identifier: BUSL-1.1-3.0-or-later
pragma solidity ^0.8.19;

import {GMKController} from "../core/GMKController.sol";

contract TestGMKControllerUpgrade is GMKController {

     /// @dev Returns the current version of this contract
    // solhint-disable-next-line func-name-mixedcase
    function VERSION() external override virtual pure returns (uint8) {
        return 2;
    }

    function isTest() external pure returns (bool) {
        return true;
    }

}
