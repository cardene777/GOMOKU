// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {SafeERC20Upgradeable, IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IRedeemable} from "./GMKToken.sol";
import {ErrZeroAddress} from "../common/Constants.sol";
import {IGMKRouter} from "./IGMKRouter.sol";
import {IDepository} from "../integrations/IDepository.sol";
import {FixedPointMathLib} from "../libraries/FixedPointMath.sol";
import {GMKControllerStorage} from "./GMKControllerStorage.sol";

/// @title GMKController
/// @notice Controls the minting and redemption of GMK stable coin.
contract GMKController is
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    GMKControllerStorage
{
    using FixedPointMathLib for uint256;
    using AddressUpgradeable for address;
    using SafeERC20Upgradeable for ERC20;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /// @notice Parameters passed to internal mint function
    /// @param assetToken The collateral lsToken
    /// @param assetAmount The collateral amount
    /// @param minAmountOut The min amount to mint
    /// @param receiver The receiver for minted tokens
    struct InternalMintParams {
        address assetToken;
        uint256 assetAmount;
        uint256 minAmountOut;
        address receiver;
        address depository;
    }

    /// @notice Parameters passed to internal mint function
    /// @param assetToken The asset lsToken
    /// @param assetAmount The asset amount
    /// @param minAmountOut The min amount to receive in swap
    /// @param receiver The account to receiver redeemed assets
    /// @param intermediary The intermediary account to transfer ERC20 to when redeeming.
    /// This is usually the same as the `receiver` parameter when redeeming LSToken.
    ///When redeeming LSToken, this is `this` contract, as LSToken is transferred to this contract,
    /// LSToken is sent to `receiver`.
    struct InternalRedeemParams {
        address assetToken;
        uint256 amountToRedeem;
        uint256 minAmountOut;
        address intermediary;
    }

    error CtrlNotWhitelisted(address lsToken);
    error CtrlNotApproved(
        address lsToken,
        address owner,
        uint256 amount
    );
    error CtrlAddressNotContract(address addr);
    error CtrlMinNotMet(uint256 minAmount, uint256 amount);
    error CtrlRedeemableAlreadySet(address redeemable);
    error CtrlReceiveNotAllowed(address sender);

    /// Events
    event RouterUpdated(address indexed by, address indexed newRouter);
    event WhitelistUpdated(
        address indexed by,
        address indexed lsToken,
        bool isWhitelisted
    );
    event Minted(address indexed caller, address indexed receiver, uint256 amount);
    event Redeemed(address indexed caller, address indexed receiver, uint256 amount);

    function initialize(address _lsToken) public initializer {
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Ownable_init();

        if (!_lsToken.isContract()) {
            revert CtrlAddressNotContract(_lsToken);
        }
        lsToken = _lsToken;
    }

    /////////////////////////////////////////////////////////////////////
    ///                     Admin functions
    /////////////////////////////////////////////////////////////////////

    /// @notice Updates the list of tokens that can be used as collateral.
    /// @param asset the asset lsToken address
    /// @param isWhitelisted true if lsToken is being added to the whitelist, false otherwise.
    function whitelistAsset(
        address asset,
        bool isWhitelisted
    ) external onlyOwner {
        if (!asset.isContract()) {
            revert CtrlAddressNotContract(asset);
        }
        whitelistedAssets[asset] = isWhitelisted;
        if (isWhitelisted) {
            _addAsset(asset);
        } else {
            _removeAsset(asset);
        }
        emit WhitelistUpdated(
            msg.sender,
            asset,
            isWhitelisted
        );
    }

    function getWhitelistedAssets() external view returns (address[] memory) {
        return assetList;
    }

    function updateRouter(address _router) external onlyOwner {
        if (!_router.isContract()) {
            revert CtrlAddressNotContract(_router);
        }

        router = IGMKRouter(_router);
        emit RouterUpdated(msg.sender, _router);
    }

    /// @notice Sets the redeemable lsToken address
    /// @dev Can only be called by governor
    /// @param _redeemable The redeemable lsToken address
    function setRedeemable(address _redeemable) external onlyOwner {
        if (address(redeemable) != address(0)) {
            revert CtrlRedeemableAlreadySet(address(redeemable));
        }
        if (!_redeemable.isContract()) {
            revert CtrlAddressNotContract(_redeemable);
        }
        redeemable = IRedeemable(_redeemable);
    }

    /// @notice Internal function to add collateral to assetList
    /// @dev Used for traversing through collateral list
    function _addAsset(address asset) private {
        for (uint256 i = 0; i < assetList.length; i++) {
            if (asset == assetList[i]) {
                return;
            }
        }
        assetList.push(asset);
    }

    /// @notice Internal function to remove collateral to assetList
    function _removeAsset(address asset) private {
        uint256 foundIndex = type(uint256).max;
        for (uint256 i = 0; i < assetList.length; i++) {
            if (asset == assetList[i]) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex != type(uint256).max) {
            if (foundIndex != assetList.length - 1) {
                assetList[foundIndex] = assetList[assetList.length-1];
            }
            assetList.pop();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    ///                        Classic mint/redeem
    ///////////////////////////////////////////////////////////////////////////

    /// @notice Mints redeemable tokens by deposirting assets
    /// @param assetToken the lsToken being used as collateral
    /// @param assetAmount The assetAmount of `assetToken` used to mint.
    /// @return amountOut The amount of redeemable minted
    function mint(
        address assetToken,
        uint256 assetAmount,
        uint256 minAmountOut,
        address receiver
    ) external nonReentrant returns (uint256) {
        // 1. check that lsToken is approved
        // 2. get clearing house from router
        // 3. transfer tokens from msg.sender to clearing house
        // 4. execute perp tx
        // 6. mint
        IERC20Upgradeable collateral = IERC20Upgradeable(assetToken);
        address account = msg.sender;
        if(collateral.allowance(account, address(this)) < assetAmount) {
            revert CtrlNotApproved(assetToken, account, assetAmount);
        }

        address depository = router.findDepositoryForDeposit(assetToken, assetAmount);
        collateral.safeTransferFrom(
            account,
            depository,
            assetAmount
        );

        InternalMintParams memory mintParams = InternalMintParams({
            assetToken: assetToken,
            assetAmount: assetAmount,
            minAmountOut: minAmountOut,
            receiver: receiver,
            depository: depository
        });
        return _mint(mintParams);
    }

    /// @notice Mints GMK with ERC20 as collateral.
    /// @dev Dpeposits ERC20 in DEX vault
    function mintWithERC20(uint256 minAmountOut, uint256 amount, address receiver)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        address collateral = lsToken;
        address depository = router.findDepositoryForDeposit(collateral, amount);

        // Deposit ERC20 with ERC20 contract and mint ERC20
        IERC20Upgradeable(lsToken).safeTransfer(depository, amount);
        InternalMintParams memory mintParams = InternalMintParams({
            assetToken: collateral,
            assetAmount: msg.value,
            minAmountOut: minAmountOut,
            receiver: receiver,
            depository: depository
        });
        return _mint(mintParams);
    }

    /// @dev internal mint function
    function _mint(InternalMintParams memory mintParams)
        internal
        returns (uint256)
    {
        if (!whitelistedAssets[mintParams.assetToken]) {
            revert CtrlNotWhitelisted(mintParams.assetToken);
        }
        uint256 amountOut = IDepository(mintParams.depository).deposit(
            mintParams.assetToken,
            mintParams.assetAmount
        );

        if (amountOut < mintParams.minAmountOut) {
            revert CtrlMinNotMet(mintParams.minAmountOut, amountOut);
        }
        redeemable.mint(mintParams.receiver, amountOut);
        emit Minted(msg.sender, mintParams.receiver, amountOut);

        return amountOut;
    }

    /// @notice Redeems a given amount of redeemable lsToken.
    /// @param assetToken the lsToken to receive by redeeming.
    /// @param redeemAmount The amount to redeemable lsToken being redeemed.
    /// @param minAmountOut The min amount of `assetToken` to receive.
    /// @param receiver The account to receive assets
    function redeem(
        address assetToken,
        uint256 redeemAmount,
        uint256 minAmountOut,
        address receiver
    ) external nonReentrant returns (uint256) {
        InternalRedeemParams memory rp = InternalRedeemParams({
            assetToken: assetToken,
            amountToRedeem: redeemAmount,
            minAmountOut: minAmountOut,
            intermediary: receiver
        });
        uint256 amountOut = _redeem(rp);
        emit Redeemed(msg.sender, receiver, amountOut);
        return amountOut;
    }

    function redeemForLsToken(
        uint256 redeemAmount,
        uint256 minAmonuntOut,
        address payable receiver
    ) external nonReentrant returns (uint256) {
        // 1. redeem ERC20 to controller
        // 2. Transfer LSToken to user

        InternalRedeemParams memory rp = InternalRedeemParams({
            assetToken: lsToken,
            amountToRedeem: redeemAmount,
            minAmountOut: minAmonuntOut,
            intermediary: address(this)
        });

        uint256 amountOut = _redeem(rp);

        // Check the contract's balance of the lsToken before transferring
        uint256 contractBalance = IERC20Upgradeable(lsToken).balanceOf(address(this));
        require(contractBalance >= amountOut, "Insufficient ERC20 balance in the contract");

        // Approve the transfer of lsToken tokens from the contract to the receiver
        IERC20Upgradeable(lsToken).approve(receiver, amountOut);

        // Transfer lsToken tokens to the receiver
        IERC20Upgradeable(lsToken).transfer(receiver, amountOut);

        emit Redeemed(msg.sender, receiver, amountOut);
        return amountOut;
    }

    /// @dev internal redeem function
    function _redeem(InternalRedeemParams memory redeemParams)
        internal
        returns (uint256)
    {
        if(redeemable.allowance(msg.sender, address(this)) < redeemParams.amountToRedeem) {
            revert CtrlNotApproved(address(redeemable), msg.sender, redeemParams.amountToRedeem);
        }

        address depository = router.findDepositoryForRedeem(
            redeemParams.assetToken,
            redeemParams.amountToRedeem
        );

        uint256 amountOut = IDepository(depository).redeem(
            redeemParams.assetToken,
            redeemParams.amountToRedeem
        );

        if (amountOut < redeemParams.minAmountOut) {
            revert CtrlMinNotMet(redeemParams.minAmountOut, amountOut);
        }
        redeemable.burn(msg.sender, redeemParams.amountToRedeem);
        IERC20Upgradeable(redeemParams.assetToken).safeTransfer(redeemParams.intermediary, amountOut);

        return amountOut;
    }

    ///////////////////////////////////////////////////////////////////////
    ///                         Upgrades
    ///////////////////////////////////////////////////////////////////////

    /// @dev Returns the current version of this contract
    // solhint-disable-next-line func-name-mixedcase
    function VERSION() external pure virtual returns (uint8) {
        return 1;
    }

    /// @dev called on upgrade. only owner can call upgrade function
    function _authorizeUpgrade(address)
        internal
        virtual
        override
        onlyOwner
    // solhint-disable-next-line no-empty-blocks
    {}
}
