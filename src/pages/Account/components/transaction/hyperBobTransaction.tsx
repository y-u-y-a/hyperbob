import { Box, Button, Input, Stack } from '@mui/material';
import React, { FC, useState } from 'react';

import { TransactionComponentProps as Props } from '../types';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import {
  sendTransactionRequest,
  sendTransactionsRequest,
} from '../../../Background/redux-slices/transactions';
import { BigNumber, Contract, ContractFactory, Wallet, ethers } from 'ethers';
import {
  DeterministicDeployer,
  SimpleAccountAPI,
} from '@account-abstraction/sdk';
import config from '../../../../exconfig.json';
import { gas } from '../../../../../utils/index';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { Provider } from 'react-redux';

import {
  Account__factory,
  HypERC20Collateral__factory,
} from '../../account-api/typechain-types';

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
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';

import JSBI from 'jsbi';
import {
  AccountImplementations,
  ActiveAccountImplementation,
} from '../../../Background/constants';
import AccountApi from '../../account-api';
import useAccountApi from '../../useAccountApi';
import AccountAPI from '../../account-api/account-api';

interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  sqrtPriceX96: ethers.BigNumber;
  liquidity: ethers.BigNumber;
  tick: number;
}

const destChainID = '11155111';
const QuoterAddr = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const PoolFactroyAddr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const GoerliUSDCAddr = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';
const GoerliBOBAddr = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8';
const SwapRouterAddr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const HypERC20CollAddr = '0x1ECB226C20978B81f21041D71Eebc15Db8D2D7C3';
// const HypERC20CollAddr = "0xd06532148869ba2fdb1af29c79ba79002a833be0"
// NOTE: This is Costomize component
export const HyperBobTransaction: FC<Props> = ({ transaction, onComplete }) => {
  const backgroundDispatch = useBackgroundDispatch();

  const [gkAddress, setGkAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [val, setVal] = useState('');
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const provider = new ethers.providers.JsonRpcProvider(activeNetwork.provider);
  // const { result, loading, callAccountApi } = useAccountApi();

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

    // console.log('transaction: %s:', JSON.stringify(transaction));

    const pubkey = '0xa321ff522233D0486F00370a15705F0406B641D4';
    const transactions: EthersTransactionRequest[] = [];

    const account = Account__factory.connect(activeAccount, provider);
    const initPopTx =
      await account.populateTransaction.initializePrivateTransfer();
    const initTx: EthersTransactionRequest = {
      ...initPopTx,
      from: activeAccount,
    };
    transactions.push(initTx);

    const amountIn = ethers.utils.parseUnits(val, 6);
    const quoter = new Contract(QuoterAddr, QuoterABI.abi, provider);
    const quotedAmountOut = await quoter.callStatic.quoteExactInputSingle(
      GoerliUSDCAddr,
      GoerliBOBAddr,
      FeeAmount.LOW,
      amountIn,
      0
    );
    console.log('amountin: %s', amountIn);
    console.log('val: %s', val);
    console.log('quotedAmountOut: %s', quotedAmountOut);

    const bobTokenContract = new Contract(
      GoerliBOBAddr,
      ERC20ABI.abi,
      provider
    );
    const approvePop = await bobTokenContract.populateTransaction.approve(
      SwapRouterAddr,
      amountIn
    );
    const approveTx: EthersTransactionRequest = {
      ...approvePop,
      from: activeAccount,
    };
    transactions.push(approveTx);

    const router = new Contract(SwapRouterAddr, SwapRouterABI.abi, provider);
    const exactInputSingleParams = {
      tokenIn: GoerliUSDCAddr,
      tokenOut: GoerliBOBAddr,
      fee: FeeAmount.LOW,
      recipient: activeAccount,
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      amountIn: amountIn,
      amountOutMinimum: BigNumber.from('0'),
      sqrtPriceLimitX96: 0,
    };
    console.log(
      'exactInputSingleParams: ',
      JSON.stringify(exactInputSingleParams)
    );
    let tradeTx = await router.populateTransaction.exactInputSingle(
      exactInputSingleParams
    );

    tradeTx = {
      ...tradeTx,
      from: activeAccount,
      gasLimit: 10000000,
    };

    console.log('tradeTx: ', JSON.stringify(tradeTx));
    transactions.push(tradeTx);

    const approveHypERC20CollPop =
      await bobTokenContract.populateTransaction.approve(
        HypERC20CollAddr,
        quotedAmountOut + 10 ** 18 * 100
      );
    // gasLimit: 10000000,
    const approveHypERC20CollTx: EthersTransactionRequest = {
      ...approveHypERC20CollPop,
      from: activeAccount,
    };

    transactions.push(approveHypERC20CollTx);

    const values = [ethers.utils.toUtf8Bytes(gkAddress)];
    const types = ['bytes'];

    if ((await provider.getCode(activeAccount)) === '0x') {
      types.push('address');
      values.push(pubkey);
    }

    const abiCorder = new ethers.utils.AbiCoder();
    const callData = abiCorder.encode(types, values);
    const hypERC20Coll = HypERC20Collateral__factory.connect(
      HypERC20CollAddr,
      provider
    );

    const hyperlaneTxPop =
      await hypERC20Coll.populateTransaction.transferRemoteWithCalldata(
        destChainID,
        utils.addressToBytes32(activeAccount),
        ethers.utils.parseEther(val),
        callData
      );

    const hyperlaneTx: EthersTransactionRequest = {
      ...hyperlaneTxPop,
      from: activeAccount,
    };

    transactions.push(hyperlaneTx);

    console.log('final transactions: %s', JSON.stringify(transactions));

    await backgroundDispatch(
      // transactionRequestのstateを変更する
      sendTransactionsRequest({
        transactionsRequest: transactions,
        origin: '',
      })
    );
    onComplete(transaction, undefined);
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
