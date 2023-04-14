// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {TokenRouter} from "@hyperlane-xyz/hyperlane-token/contracts/libs/TokenRouter.sol";
import {ERC777, Context, IERC20} from "@openzeppelin/contracts/token/ERC777/ERC777.sol";

/**
 * @title Hyperlane ERC20 Token Router that extends ERC20 with remote transfer functionality.
 * @author Abacus Works
 * @dev Supply on each chain is not constant but the aggregate supply across all chains is.
 */
contract HypERC20 is TokenRouter, ERC777 {
    address public canonicalToken;

    constructor(
        string memory _name,
        string memory _symbol,
        address[] memory defaultOperators,
        uint256 _gasAmount
    ) ERC777(_name, _symbol, defaultOperators) TokenRouter(_gasAmount) {
        // decimalsConfig = _decimals; or 18
    }

    function initialize(
        address _mailbox,
        address _interchainGasPaymaster,
        address _canonicalToken
    ) external initializer {
        // transfers ownership to `msg.sender`
        __HyperlaneConnectionClient_initialize(
            _mailbox,
            _interchainGasPaymaster
        );

        canonicalToken = _canonicalToken;
    }

    function _transferFromSender(
        uint256 _amount
    ) internal override returns (bytes memory) {
        _burn(msg.sender, _amount, bytes(""), bytes(""));
        return bytes(""); // no metadata
    }

    // can't override handle() so modify this method entirely.
    function _transferTo(
        address _recipient,
        uint256 _amount,
        bytes calldata _calldata // no metadata
    ) internal override {
        _mint(_recipient, _amount, _calldata, bytes(""));
    }

    function convertToCanonicalToken(address _receiver, uint _amount) external {
        require(balanceOf(msg.sender) >= _amount, "INSUFFICIENT_AMOUNT");
        require(
            _getCanoTokenBal(address(this)) >= _amount,
            "INSUFFICIENT_BALANCE"
        );
        IERC20(canonicalToken).transfer(_receiver, _amount);
        _burn(_receiver, _amount, bytes(""), bytes(""));
    }

    function _getCanoTokenBal(address _addr) internal view returns (uint) {
        return IERC20(canonicalToken).balanceOf(_addr);
    }

    function _msgSender()
        internal
        view
        override(Context, ContextUpgradeable)
        returns (address)
    {
        return msg.sender;
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ContextUpgradeable)
        returns (bytes calldata)
    {
        return msg.data;
    }
}

/*

There should be system to accepts ERC20 liquidity from rnadom LPs
So that seamless conversion between hypERC20 to canonical ERC20 on a remote chain can be carried out. 
In that case, deposit/withdraw function will be implemented like below, along with convertToCanonicalToken

    function depositCanonicalToken(address _lp, uint _amount) public {
        require(_getCanoTokenBal(msg.sender) >= _amount, "INSUFFICIENT_AMOUNT");
        IERC20(canonicalToken).transferFrom(_lp, address(this), _amount);
        _mint(_lp, _amount, bytes(0), bytes(0), false);
    }

    function withdrawCanonicalToken(address _lp, uint _amount) public {
        require(balanceOf(msg.sender) >= _amount, "INSUFFICIENT_AMOUNT");
        IERC20(canonicalToken).transfer(address(this), _amount);
        _burn(_lp, _amount);
    }


        //IERC20Upgradeable(canonicalToken).transfer(address(this), _amount);
        // should call fallback in sender contract if contract
        // data... abi.decode..
        // IHypReciver().message(_origin, _sender, _amount)

*/
