// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import {ErrZeroAddress} from "../common/Constants.sol";
import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import {ERC20Snapshot} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFTV2} from "@layerzerolabs/solidity-examples/contracts/token/oft/v2/OFTV2.sol";

//    _     _      _     _      _     _
//   (c).-.(c)    (c).-.(c)    (c).-.(c)
//    / ._. \      / ._. \      / ._. \
//  __\( Y )/__  __\( Y )/__  __\( Y )/__
// (_.-/'-'\-._)(_.-/'-'\-._)(_.-/'-'\-._)
//    || G ||      || M ||      || K ||
//  _.' `-' '._  _.' `-' '._  _.' `-' '._
// (.-./`-'\.-.)(.-./`-'\.-.)(.-./`-'\.-.)
//  `-'     `-'  `-'     `-'  `-'     `-'

//    ____     __  __      _  __
// U /"___|u U|' \/ '|u   |"|/ /
// \| |  _ / \| |\/| |/   | ' /
//  | |_| |   | |  | |  U/| . \\u
//   \____|   |_|  |_|    |_|\_\
//   _)(|_   <<,-,,-.   ,-,>> \\,-.
//  (__)__)   (./  \.)   \.)   (_/

interface IRedeemable is IERC20 {
    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;
}

/// @title GMKToken
/// @notice GMKToken token contract
contract GMKToken is ERC20Permit, OFTV2, ERC20Snapshot, IRedeemable {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event Minted(address indexed account, uint256 amount);

    event Burned(address indexed account, uint256 amount);

    event LocalMintCapChanged(address indexed by, uint256 cap);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error NotController(address msgSender);

    error LocalMintCapExceeded(uint256 localMintCap, uint256 newLocalMint);

    /*//////////////////////////////////////////////////////////////
                            METADATA STORAGE
    //////////////////////////////////////////////////////////////*/
    /// @dev max amount that can be minted on this chain.
    uint256 public localMintCap;

    /// @dev Net amount minted on this chain.
    uint256 public localMintAmount;

    /// @notice GMK controller that controls minting and burning.
    /// @dev can not be updated after initialization
    address public immutable controller;

    modifier onlyController() {
        if (controller == address(0) || msg.sender != controller) {
            revert NotController(msg.sender);
        }
        _;
    }

    constructor(address _controller, address lzEndpoint)
        OFTV2("GMK", "GMK", 8, lzEndpoint)
        ERC20Permit("GMK")
    {
        if (_controller == address(0)) {
            revert ErrZeroAddress();
        }
        controller = _controller;
    }

    /// @notice Mint tokens to a given account.
    /// @dev Can only be called by the controller.
    /// @param account The account to mint tokens to.
    /// @param amount The amount of tokens to mint
    function mint(address account, uint256 amount) external onlyController {
        localMintAmount += amount;
        _checkLocalMint();
        _mint(account, amount);
        emit Minted(account, amount);
    }

    /// @notice Burn tokens from a given account.
    /// @dev Can only be called by the controller.
    /// @param account The account to burn tokens from.
    /// @param amount The amount of tokens to burn.
    function burn(address account, uint256 amount) external onlyController {
        localMintAmount -= amount;
        if (account != msg.sender) {
            _spendAllowance(account, msg.sender, amount);
        }
        _burn(account, amount);
        emit Burned(account, amount);
    }

    /// @notice Sets the global supply cap for GMK token.
    /// @dev Called by governance
    /// @param newMintCap the new local mint cap
    function setLocalMintCap(uint256 newMintCap) external onlyOwner {
        require(newMintCap > 0, "Zero Amount");
        localMintCap = newMintCap;

        emit LocalMintCapChanged(msg.sender, localMintCap);
    }

    function _checkLocalMint() private view {
        if (localMintAmount > localMintCap) {
            revert LocalMintCapExceeded(localMintCap, localMintAmount);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /// @dev Takes a snapshot
    function takeSnapshot() external onlyOwner {
        _snapshot();
    }
}
