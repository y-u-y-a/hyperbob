pragma solidity ^0.8.12;

import "../Account.sol";

interface IAccountFactory {
    function createAccount(
        address owner,
        uint256 salt
    ) external returns (Account ret);

    function getAddress(
        address owner,
        uint256 salt
    ) external view returns (address);
}
