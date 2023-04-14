import { ethers } from 'hardhat';
// import { BOBDepositToQueue, BOBDepositToQueue__factory } from '../types';
import { Pool, computePoolAddress, FeeAmount } from '@uniswap/v3-sdk';
import { Token, SupportedChainId } from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import SwapRouter from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';

const QuoterAddr = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const PoolFactroyAddr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const GoerliUSDCAddr = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';
const GoerliBOBAddr = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8';
const USDCAddr = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const BOBAddr = '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B';
const SwapRouterAddr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

async function main() {
  const [signer] = await ethers.getSigners();
  const currentPoolAddress = computePoolAddress({
    factoryAddress: PoolFactroyAddr,
    tokenA: new Token(SupportedChainId.GOERLI, GoerliUSDCAddr, 18),
    tokenB: new Token(SupportedChainId.GOERLI, GoerliBOBAddr, 18),
    fee: FeeAmount.LOWEST,
  });

  console.log(currentPoolAddress);

  //   const poolContract = new ethers.Contract(
  //     currentPoolAddress,
  //     IUniswapV3PoolABI.abi,
  //     ethers.provider
  //   );

  const quoterContract = new ethers.Contract(
    QuoterAddr,
    Quoter.abi,
    ethers.provider
  );

  const router = new ethers.Contract(
    SwapRouterAddr,
    SwapRouter.abi,
    ethers.provider
  );

  // console.log(await poolContract.callStatic.token0());
  //   console.log(await poolContract.callStatic.token1());

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    GoerliUSDCAddr,
    GoerliBOBAddr,
    FeeAmount.LOW,
    ethers.utils.parseUnits('1', 18),
    0
  );

  router.console.log(quotedAmountOut);
  // console.log(quotedAmountOut);

  //   QuoterAddr
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
