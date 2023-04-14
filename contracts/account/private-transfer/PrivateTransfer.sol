// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {ERC777} from "./ERC777.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";
import "hardhat/console.sol";
import "./PriavteTransferStorage.sol";

abstract contract PrivateTransfer is ERC777, PriavteTransferStorage {
    using TypeCasts for bytes32;

    function _initializePrivateTransfer() internal {
        _registerERC777();
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata _userData, // zkAddress
        bytes calldata operatorData
    ) external override {
        // msg.sender must be hypBOB if it's ERC777 token transfer from bridge(hypERC20 itself)
        require(msg.sender == address(hypBOB), "INVALID_CALLER");

        // make sure that BOB is sent from the same address (AA) on L1.
        require(from == address(this), "INVALID_TOKEN_SENDER");

        // carry out private transfer
        _executePrivateTransfer(_userData, amount);
    }

    function _executePrivateTransfer(
        bytes memory _zkAddress,
        uint _amount
    ) internal {
        // convert hypBOB to BOB
        // 1. approve hypBOB contract
        // 2. convertToCanonicalToken
        convertHypBOBtoBOB(_amount);

        // ( in case non-BOB is briddged from L1: swap ERC20 for BOB)
        // deposit BOB to zkBOB pool
        // 1. approve zkBOB contract
        // transfer BOB
        _transferToBob(_zkAddress, _amount, address(this));
    }

    function convertHypBOBtoBOB(uint _amount) internal {
        // IERC20 bob = IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
        sBOB.approve(address(hypBOB), _amount);

        // convert hypBOB to canonical BOB
        hypBOB.convertToCanonicalToken(_amount);
    }

    function _transferToBob(
        bytes memory _zkAddress,
        uint256 amount,
        address fallbackReceiver
    ) internal {
        // zK bob address for sepolia
        // IERC20 bob = IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
        // IZkBobDirectDeposits queue = IZkBobDirectDeposits(
        //     0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade
        // );

        // address fallbackReceiver = msg.sender;

        // Option A, through pool contract
        // Note that ether is an alias for 10**18 multiplier, as BOB token has 18 decimals
        sBOB.approve(address(queue), amount * 10 ** 18);
        uint256 depositId = queue.directDeposit(
            fallbackReceiver,
            amount * 10 ** 18,
            _zkAddress
        );
        console.log("Deposit ID: %s", depositId);

        // Option B, through ERC677 token interface
        // bob.transferAndCall(address(queue), 100 ether, abi.encode(fallbackReceiver, zkAddress));
    }

    function testTransferToBOB(
        bytes memory _zkAddress,
        uint256 amount,
        address fallbackReceiver
    ) public {
        sBOB.approve(address(queue), amount * 10 ** 18);
        uint256 depositId = queue.directDeposit(
            fallbackReceiver,
            amount * 10 ** 18,
            _zkAddress
        );
    }

    function checkDepositStatus() external view {
        // IZkBobDirectDeposits.DirectDeposit memory deposit = queue
        //     .getDirectDeposit(depositId);
        // require(
        //     deposit.status == IZkBobDirectDeposits.DirectDepositStatus.Completed
        // );
    }

    function bridgBOB(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amount,
        bytes memory _zkAddress
    ) public {
        // make sure that caller is this AA wallet
        require(
            TypeCasts.bytes32ToAddress(_recipient) != address(0),
            "INVALID_ADDRESS"
        );
        require(_amount != 0, "INVALID_AMOUNT");
        require(msg.sender == address(this), "INVALID_CALLER");

        gBOB.approve(address(hypBOBCollateral), _amount);
        hypBOBCollateral.transferRemoteWithCalldata(
            _destination,
            _recipient,
            _amount,
            _zkAddress
        );
    }
}
