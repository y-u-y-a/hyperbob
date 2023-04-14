pragma solidity ^0.8.12;

import {PrivateTransfer} from "./private-transfer/PrivateTransfer.sol";
import "@account-abstraction/contracts/samples/SimpleAccount.sol";

contract Account is SimpleAccount, PrivateTransfer {
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    function initialize(
        address _owner,
        address _zkBOBPool,
        address _hypBOBCollateral,
        address _hypBOB
    ) public initializer {
        _initialize(_owner);
        _initializePrivateTransfer(_zkBOBPool, _hypBOBCollateral, _hypBOB);
    }
}
