// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IHypERC20 is IERC20 {
    function convertToCanonicalToken(address _receiver, uint _amount) external;
}
