// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IHypERC20Collateral} from '../../bridge/interfaces/IHypERC20Collateral.sol';
import {IHypERC20} from '../../bridge/interfaces/IHypERC20.sol';
import {IZkBobDirectDeposits} from './interfaces/IZkBobDirectDeposits.sol';

contract PriavteTransferStorage {
    // Goerli(local)
    IERC20 public immutable gBOB =
        IERC20(0x97a4ab97028466FE67F18A6cd67559BAABE391b8);
    IHypERC20Collateral public immutable hypBOBCollateral =
        IHypERC20Collateral(0xB3B6505cB4CAcEFE38E0ec635Ce595791b1B6f32);
    IUniswapV2Router02 public immutable uniRouter =
        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    // Sepolia(destination)
    IERC20 public immutable sBOB =
        IERC20(0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f);
    IHypERC20 public immutable hypBOB =
        IHypERC20(0x886638597B6FAe51858Bd777d51192d100401274);
    IZkBobDirectDeposits public immutable queue =
        IZkBobDirectDeposits(0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade);
}
