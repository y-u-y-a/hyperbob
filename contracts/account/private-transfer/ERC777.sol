// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";

abstract contract ERC777 is IERC777Sender, IERC777Recipient {
    IERC1820Registry internal constant _ERC1820_REGISTRY =
        IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    function _registerERC777() internal {
        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensSender"),
            address(this)
        );

        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensRecipient"),
            address(this)
        );
    }

    function tokensToSend(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {}

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata _userData,
        bytes calldata operatorData
    ) external {
        require(from == address(this), "INVALID_SENDER");
        _executePrivateTransfer(_userData);
    }

    function _executePrivateTransfer(bytes memory _data) internal virtual {}
}
