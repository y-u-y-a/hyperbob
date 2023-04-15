// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

interface IHypERC20Collateral {
    function transferRemoteWithCalldata(
        uint32 _destination,
        bytes32 _recipient,
        uint256 _amountOrId,
        bytes memory _calldata
    ) external payable;

    function routers(uint32 _domain) external view returns (bytes32);
}
