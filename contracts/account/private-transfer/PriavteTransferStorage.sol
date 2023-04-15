// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IHypERC20Collateral} from "../../bridge/interfaces/IHypERC20Collateral.sol";
import {IHypERC20} from "../../bridge/interfaces/IHypERC20.sol";
import {IZkBobDirectDeposits} from "./interfaces/IZkBobDirectDeposits.sol";

interface IUniswapRouter {}

contract PriavteTransferStorage {
    // Goerli(local)
    IERC20 public immutable gBOB =
        IERC20(0x97a4ab97028466FE67F18A6cd67559BAABE391b8);
    IHypERC20Collateral public immutable hypBOBCollateral =
        IHypERC20Collateral(0xd06532148869Ba2Fdb1aF29c79Ba79002a833bE0);

    // Sepolia(destination)
    IERC20 public immutable sBOB =
        IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
    IHypERC20 public immutable hypBOB =
        IHypERC20(0x0c98A817242eB4978613f60E4f4820840e7A5a12);
    IZkBobDirectDeposits public immutable queue =
        IZkBobDirectDeposits(0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade);
}
