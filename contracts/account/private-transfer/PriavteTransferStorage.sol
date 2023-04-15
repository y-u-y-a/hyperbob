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
        IHypERC20Collateral(0x1ECB226C20978B81f21041D71Eebc15Db8D2D7C3);

    // Sepolia(destination)
    IERC20 public immutable sBOB =
        IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
    IHypERC20 public immutable hypBOB =
        IHypERC20(0x79439b04066E15715A4e9D2c926EA02B01a00435);
    IZkBobDirectDeposits public immutable queue =
        IZkBobDirectDeposits(0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade);
}
