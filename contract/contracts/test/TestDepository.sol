// SPDX-License-Identifier: BUSL-1.1-3.0-or-later
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IDepository} from "../integrations/IDepository.sol";

/// @title TestDepository
/// @dev Test depository functions without external interactions
contract TestDepository is Ownable {
    event CollateralDeposited(address indexed token, uint256 amount);
    event CollateralWithdrawnTo(
        address indexed token,
        uint256 amount,
        address indexed to
    );
    event ShortOpened(
        uint256 amount,
        address indexed collateral
    );
    event LongOpened(
        uint256 amount,
        address indexed collateral
    );

    address public assetToken;
    address public quoteToken;
    address public market;
    uint256 public netAssetDeposits;

    /// @notice Initializer
    /// @param _futuresMarket marktet
    /// @param _assetToken Collateral token
    function initialize(
        address _futuresMarket,
        address _assetToken,
        address _quoteToken
    ) public {
        assetToken = _assetToken;
        quoteToken = _quoteToken;
        market = _futuresMarket;
    }
    function deposit(address token, uint256 amount) external returns (uint256) {
        emit CollateralDeposited(address(token), amount);
        netAssetDeposits += amount;
        return amount;
    }

    function redeem(address token, uint256 amount) external returns (uint256) {
        emit CollateralWithdrawnTo(token, amount, address(0));
        require(netAssetDeposits >= amount, "Insufficient netAssetDeposits");
        netAssetDeposits -= amount;
        return amount;
    }

    function supportedAssets() external view returns (address[] memory) {
        address[] memory assetList = new address[](2);
        assetList[0] = assetToken;
        assetList[1] = quoteToken;
        return assetList;
    }
}
