import { Box, Button, Input, Stack } from '@mui/material';
import React, { FC, useState } from 'react';

import { TransactionComponentProps as Props } from '../types';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { sendTransactionsRequest } from '../../../Background/redux-slices/transactions';
import { Contract, ContractFactory, ethers } from 'ethers';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import config from '../../../../exconfig.json';
import { gas } from '../../../../../utils/index';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { Provider } from 'react-redux';

import { HypERC20Collateral__factory } from '../../account-api/typechain-types';

import HypERC20CollateralABI from '../../../../artifacts/contracts/bridge/HypERC20Collateral.sol/HypERC20Collateral.json';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20.json';
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import QuoterABI from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import UniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';

import {
  getActiveAccount,
  getAccountInfo,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { utils } from '@hyperlane-xyz/utils';
import { EthersTransactionRequest } from '../../../Background/services/types';

import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import {
  Pool,
  Route,
  SwapOptions,
  FeeAmount,
  SwapQuoter,
  SwapRouter,
  computePoolAddress,
  Trade,
} from '@uniswap/v3-sdk';

import JSBI from 'jsbi';

interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  sqrtPriceX96: ethers.BigNumber;
  liquidity: ethers.BigNumber;
  tick: number;
}

const chainID = '11155111';
const QuoterAddr = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const PoolFactroyAddr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const GoerliUSDCAddr = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';
const GoerliBOBAddr = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8';
const SwapRouterAddr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
// NOTE: This is Costomize component
export const HyperBobTransaction: FC<Props> = ({ transaction, onComplete }) => {
  const backgroundDispatch = useBackgroundDispatch();

  const [gkAddress, setGkAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [val, setVal] = useState('');
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const provider = new ethers.providers.JsonRpcProvider(activeNetwork.provider);

  const getPoolInfo = async (tokenA, tokenB, poolFee): Promise<PoolInfo> => {
    const currentPoolAddress = computePoolAddress({
      factoryAddress: PoolFactroyAddr,
      tokenA: tokenA,
      tokenB: tokenB,
      fee: poolFee,
    });

    UniswapV3PoolABI;

    const pool = new ethers.Contract(
      currentPoolAddress,
      UniswapV3PoolABI.abi,
      provider
    );

    const [token0, token1, fee, tickSpacing, liquidity, slot0] =
      await Promise.all([
        pool.token0(),
        pool.token1(),
        pool.fee(),
        pool.tickSpacing(),
        pool.liquidity(),
        pool.slot0(),
      ]);

    return {
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    };
  };

  const changeTransaction = async () => {
    // TODO: 新しいトランザクションを作成をすれば確認画面へ遷移する

    const chainID = ethers.utils.parseUnits(activeNetwork.chainID);

    console.log('chainID: ', chainID);

    const HypERC20CollFactory = new HypERC20Collateral__factory();

    const dep = new DeterministicDeployer(provider);
    const HypERC20CollAddr =
      DeterministicDeployer.getDeterministicDeployAddress(
        HypERC20CollFactory,
        0,
        [GoerliBOBAddr, gas.GAS_LIMIT]
      );

    if (!(await dep.isContractDeployed(HypERC20CollAddr))) {
      // thowError
      console.log('ないよ！！', HypERC20CollAddr);
      // tokenAddressに対応したブリッジがないよ
    }

    const HypERC20Coll = HypERC20CollFactory.attach(HypERC20CollAddr);

    console.log(chainID, activeAccount, tokenAddress);

    
    const transactions: EthersTransactionRequest[] = [];

    const amountIn = ethers.utils.parseUnits(val, 18);

    const quoter = new Contract(QuoterAddr, QuoterABI.abi, provider);

    const quotedAmountOut = await quoter.callStatic.quoteExactInputSingle(
      GoerliUSDCAddr,
      GoerliBOBAddr,
      FeeAmount.LOW,
      amountIn,
      0
    );

    const poolInfo = await getPoolInfo(
      GoerliUSDCAddr,
      GoerliBOBAddr,
      FeeAmount.LOW
    );

    const usdcToken = new Token(chainID.toNumber(), GoerliUSDCAddr, 18);
    const bobToken = new Token(chainID.toNumber(), GoerliBOBAddr, 18);

    const pool = new Pool(
      usdcToken,
      bobToken,
      FeeAmount.LOW,
      poolInfo.sqrtPriceX96.toString(),
      poolInfo.liquidity.toString(),
      poolInfo.tick
    );

    const swapRoute = new Route([pool], usdcToken, bobToken);

    const uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        usdcToken,
        fromReadableAmount(amountIn.toNumber(), 18).toString()
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        bobToken,
        JSBI.BigInt(quotedAmountOut)
      ),
      tradeType: TradeType.EXACT_INPUT,
    });

    const erc20 = new Contract(GoerliBOBAddr, ERC20ABI.abi, provider);

    const approvePop = await erc20.populateTransaction.approve(
      SwapRouterAddr,
      amountIn
    );

    const approveTx = Object.assign(transaction, approvePop);

    transactions.push(approveTx);

    const options: SwapOptions = {
      slippageTolerance: new Percent(500, 10000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: activeAccount,
    };

    const methodParameters = SwapRouter.swapCallParameters(
      [uncheckedTrade],
      options
    );

    let tradeTx = {
      data: methodParameters.calldata,
      to: SwapRouterAddr,
      // value: methodParameters.value,
    };

    tradeTx = Object.assign(transaction, tradeTx);

    transactions.push(tradeTx);

    // uni.swapExactETHForTokens(eth, [GoerliWETHAddr]);

    // uni.quoteExactInputSingle();
    const abiCorder = new ethers.utils.AbiCoder();
    const callData = abiCorder.encode(
      ['bytes', 'address'],
      [gkAddress, '0x3bd088c19960a8b5d72e4e01847791bd0dd1c9e6']
    );

    const hyperlaneTxPop =
      await HypERC20Coll.populateTransaction.transferRemoteWithCalldata(
        chainID,
        utils.addressToBytes32(activeAccount),
        ethers.utils.parseEther(val),
        callData
      );

    const tx = Object.assign(transaction, hyperlaneTxPop);

    // console.log('hyperlaneTxPop: %s', JSON.stringify(hyperlaneTxPop));

    transactions.push(tx);

    console.log('transaction: %s', JSON.stringify(transactions));

    await backgroundDispatch(
      // transactionRequestのstateを変更する
      sendTransactionsRequest({
        transactionsRequest: transactions,
        origin: '',
      })
    );
    onComplete(transaction, undefined);
    console.log({ transaction });
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <h3 style={{ margin: '20px auto', fontSize: '20px', fontWeight: 'bold' }}>
        Enter a destination address
      </h3>
      <Box marginBottom="20px">
        <Stack spacing={2} style={{ width: '80%', margin: '0 auto 20px' }}>
          <Input
            value={gkAddress}
            name="gk_address"
            placeholder="gk_addressを入力してください"
            onChange={(e) => setGkAddress(e.target.value)}
            sx={{ paddingLeft: '10px', paddingRight: '10px' }}
          />
          <Input
            value={tokenAddress}
            name="token_address"
            placeholder="token_addressを入力してください"
            onChange={(e) => setTokenAddress(e.target.value)}
            sx={{ paddingLeft: '10px', paddingRight: '10px' }}
          />
          <Input
            value={val}
            name="value"
            placeholder="valueを入力してください"
            onChange={(e) => setVal(e.target.value)}
            sx={{ paddingLeft: '10px', paddingRight: '10px' }}
          />
        </Stack>
        <Box display="flex" justifyContent="center">
          <Button size="large" variant="contained" onClick={changeTransaction}>
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

function fromReadableAmount(amount: number, decimals: number): JSBI {
  const extraDigits = Math.pow(10, countDecimals(amount));
  const adjustedAmount = amount * extraDigits;
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
    ),
    JSBI.BigInt(extraDigits)
  );
}

function countDecimals(x: number) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split('.')[1].length || 0;
}
export default HyperBobTransaction;
