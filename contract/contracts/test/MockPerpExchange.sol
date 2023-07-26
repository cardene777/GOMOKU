// SPDX-License-Identifier: BUSL-1.1-3.0-or-later
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockPerpExchange {
    mapping (address => uint160) private _markPrices;

    receive() external payable {}

    function getAllPendingFundingPayment(address) external pure returns (uint256) {
        return 100 * 10 ** 18;
    }

    function setSqrtMarkTwapX96(address account, uint160 markPriceSqrtX96) external {
        _markPrices[account] = markPriceSqrtX96;
    }

    function getSqrtMarkTwapX96(address account, uint32) external view returns (uint160) {
        return _markPrices[account];
    }
}
