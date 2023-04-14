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
    // IWETH public immutable weth =
    //     IWETH(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
    IHypERC20Collateral public immutable hypBOBCollateral =
        IHypERC20Collateral(0xe903BB1EAF963bbFad9e53080453bd35446f97A6);
    IUniswapRouter public immutable uniRouter =
        IUniswapRouter(0x4648a43B2C14Da09FdF82B161150d3F634f40491);

    // Sepolia(destination)
    IERC20 public immutable sBOB =
        IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
    IHypERC20 public immutable hypBOB =
        IHypERC20(0xD98DF34d83ca1cc87a4C39f393492F2eA0d516e5);
    IZkBobDirectDeposits public immutable queue =
        IZkBobDirectDeposits(0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade);

    uint32 public localDomain = 5;
    uint32 public remoteDomain = 11155111;
}
