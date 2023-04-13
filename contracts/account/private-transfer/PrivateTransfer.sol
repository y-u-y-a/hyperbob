// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {IHypERC20Collateral} from "../../bridge/interfaces/IHypERC20Collateral.sol";
import {IHypERC20} from "../../bridge/interfaces/IHypERC20.sol";
import {ERC777} from "./ERC777.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

abstract contract PrivateTransfer is ERC777 {
    address public zkBOBPool;
    IHypERC20Collateral public hypBOBCollateral;
    IHypERC20 public hypBOB;

    modifier onlySelf() {
        require(msg.sender == address(this), "INVALID_CALLER");
        _;
    }

    function _initializePrivateTransfer(
        address _zkBOBPool,
        address _hypBOBCollateral,
        address _hypBOB
    ) internal {
        zkBOBPool = _zkBOBPool;
        hypBOBCollateral = IHypERC20Collateral(_hypBOBCollateral);
        hypBOB = IHypERC20(_hypBOB);

        _registerERC777();
    }

    function _executePrivateTransfer(bytes memory _data) internal override {
        // convert hypBOB to BOB
        // 1. approve hypBOB contract
        // 2. convertToCanonicalToken
        // ( in case non-BOB is briddged from L1: swap ERC20 for BOB)
        // deposit BOB to zkBOB pool
        // 1. approve zkBOB contract
        // transfer BOB
    }

    function _convertHypBOBtoBOB() internal {
        // appprove address(hypBOB)
        // hypBOB.convertToCanonicalToken()
    }

    // directDeposit() public

    function bridgeBOB() public onlySelf {
        // approve address(hypBOBCollateral)
        // hypBOBCollateral.transferRemoteWithCalldata()
    }
}
