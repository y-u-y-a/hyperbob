pragma solidity ^0.8.12;

import {PrivateTransfer} from "./private-transfer/PrivateTransfer.sol";
import "@account-abstraction/contracts/samples/SimpleAccount.sol";

contract Account is SimpleAccount, PrivateTransfer {
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    function initialize(address _owner) public override initializer {
        _initialize(_owner);
    }
    
    function initializePrivateTransfer() public {
        _registerERC777();
    }
}
