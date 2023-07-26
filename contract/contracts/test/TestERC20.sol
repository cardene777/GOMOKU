// SPDX-License-Identifier: BUSL-1.1-3.0-or-later
pragma solidity ^0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {

    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 nDecimals) ERC20(name, symbol) {
        _decimals = nDecimals;
        _mint(msg.sender, 1_000_000 * 10 ** _decimals);
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
