// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {TokenRouter} from "@hyperlane-xyz/hyperlane-token/contracts/libs/TokenRouter.sol";
import {Message} from "@hyperlane-xyz/hyperlane-token/contracts/libs/Message.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Hyperlane ERC20 Token Collateral that wraps an existing ERC20 with remote transfer functionality.
 * @author Abacus Works
 */

contract HypERC20Collateral is TokenRouter {
    using SafeERC20 for IERC20;

    //  uint256 internal immutable override gasAmount;

    IERC20 public immutable wrappedToken;

    /**
     * @notice Constructor
     * @param erc20 Address of the token to keep as collateral
     */
    constructor(address erc20, uint256 _gasAmount) TokenRouter(_gasAmount) {
        wrappedToken = IERC20(erc20);
    }

    /**
     * @notice Initializes the Hyperlane router.
     * @param _mailbox The address of the mailbox contract.
     * @param _interchainGasPaymaster The address of the interchain gas paymaster contract.
     */
    function initialize(
        address _mailbox,
        address _interchainGasPaymaster
    ) external initializer {
        __HyperlaneConnectionClient_initialize(
            _mailbox,
            _interchainGasPaymaster
        );
    }

    function balanceOf(address _account) external view returns (uint256) {
        return wrappedToken.balanceOf(_account);
    }

    /**
     * @dev Transfers `_amount` of `wrappedToken` from `msg.sender` to this contract.
     * @inheritdoc TokenRouter
     */
    function _transferFromSender(
        uint256 _amount
    ) internal override returns (bytes memory) {
        wrappedToken.safeTransferFrom(msg.sender, address(this), _amount);
        return bytes(""); // no metadata
    }

    /**
     * @dev Transfers `_amount` of `wrappedToken` from this contract to `_recipient`.
     * @inheritdoc TokenRouter
     */
    function _transferTo(
        address _recipient,
        uint256 _amount,
        bytes calldata // no metadata
    ) internal override {
        wrappedToken.safeTransfer(_recipient, _amount);
    }

    function transferRemoteWithCalldata(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amountOrId,
        bytes memory _calldata
    ) external payable returns (bytes32 messageId) {
        _transferFromSender(_amountOrId);

        messageId = _dispatchWithGas(
            _destination,
            Message.format(_recipient, _amountOrId, _calldata),
            gasAmount,
            msg.value,
            msg.sender
        );

        emit SentTransferRemote(_destination, _recipient, _amountOrId);
    }
}
