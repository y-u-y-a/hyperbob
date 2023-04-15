import { BoxProps, FormControl, FormGroup, Typography } from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { sendTransactionRequest } from '../../../Background/redux-slices/transactions';
import { Contract, ethers } from 'ethers';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { gas } from '../../../../../utils/index';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';

import {
  Account__factory,
  HypERC20Collateral__factory,
} from '../../../Account/account-api/typechain-types';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20.json';
import QuoterABI from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import UniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';

import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { utils } from '@hyperlane-xyz/utils';
import { EthersTransactionRequest } from '../../../Background/services/types';

import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core';
import {
  Pool,
  Route,
  SwapOptions,
  FeeAmount,
  SwapRouter,
  computePoolAddress,
  Trade,
} from '@uniswap/v3-sdk';

import JSBI from 'jsbi';
import { BorderBox } from '../../../../components/BorderBox';
import { Center } from '../../../../components/Center';
import { FormInput } from '../../../../components/FormInput';
import { HeadTitle } from '../../../../components/HeadTitle';
import Header from '../../components/header';
import { colors } from '../../../../config/const';
import { Button } from '../../../../components/Button';
import { useNavigate } from 'react-router-dom';

interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  sqrtPriceX96: ethers.BigNumber;
  liquidity: ethers.BigNumber;
  tick: number;
}

// const chainID = '11155111';
const QuoterAddr = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const PoolFactroyAddr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const GoerliUSDCAddr = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';
const GoerliBOBAddr = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8';
const SwapRouterAddr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
// const HypERC20CollAddr = "0xd06532148869ba2fdb1af29c79ba79002a833be0"

type Props = BoxProps & {};

export const TransferForm: FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  const backgroundDispatch = useBackgroundDispatch();

  const [zkAddress, setZkAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [value, setValue] = useState('');
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const provider = new ethers.providers.JsonRpcProvider(activeNetwork.provider);
  // const { result, loading, callAccountApi } = useAccountApi();

  const getPoolInfo = async (
    tokenA: Token,
    tokenB: Token,
    poolFee: FeeAmount
  ): Promise<PoolInfo> => {
    const currentPoolAddress = computePoolAddress({
      factoryAddress: PoolFactroyAddr,
      tokenA: tokenA,
      tokenB: tokenB,
      fee: poolFee,
    });

    // UniswapV3PoolABI;

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
    sendEth();
    // console.log('transaction: %s:', JSON.stringify(transaction));

    const pubkey = '0xa321ff522233D0486F00370a15705F0406B641D4';
    const transactions: EthersTransactionRequest[] = [];

    const chainID = parseInt(activeNetwork.chainID);
    const account = Account__factory.connect(activeAccount, provider);

    const initPopTx =
      await account.populateTransaction.initializePrivateTransfer();

    console.log('initPopTx: %s', initPopTx);

    const initTx: EthersTransactionRequest = {
      ...initPopTx,
      from: activeAccount,
    };

    transactions.push(initTx);

    console.log('chainID: ', chainID);

    const HypERC20CollFactory = new HypERC20Collateral__factory();

    const dep = new DeterministicDeployer(provider);
    const HypERC20CollAddr =
      DeterministicDeployer.getDeterministicDeployAddress(
        HypERC20CollFactory,
        0,
        [GoerliBOBAddr, gas.DEST_GAS_AMOUNT]
      );

    if (!(await dep.isContractDeployed(HypERC20CollAddr))) {
      // thowError
      console.log('ないよ！！', HypERC20CollAddr);
      // tokenAddressに対応したブリッジがないよ
    }

    const HypERC20Coll = HypERC20CollFactory.attach(HypERC20CollAddr);

    console.log(chainID, activeAccount, toAddress);

    const amountIn = ethers.utils.parseUnits(value, 6);

    const quoter = new Contract(QuoterAddr, QuoterABI.abi, provider);

    const quotedAmountOut = await quoter.callStatic.quoteExactInputSingle(
      GoerliUSDCAddr,
      GoerliBOBAddr,
      FeeAmount.LOW,
      amountIn,
      0
    );

    const usdcToken = new Token(chainID, GoerliUSDCAddr, 6);
    const bobToken = new Token(chainID, GoerliBOBAddr, 18);
    console.log('amountin: %s', amountIn);
    console.log('value: %s', value);

    const poolInfo = await getPoolInfo(usdcToken, bobToken, FeeAmount.LOW);

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
        fromReadableAmount(parseInt(value), 6).toString()
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        bobToken,
        JSBI.BigInt(quotedAmountOut)
      ),
      tradeType: TradeType.EXACT_INPUT,
    });

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

    transactions.push(tradeTx);

    const approveHypERC20CollPop =
      await bobTokenContract.populateTransaction.approve(
        HypERC20CollAddr,
        quotedAmountOut
      );

    const approveHypERC20CollTx: EthersTransactionRequest = {
      ...approveHypERC20CollPop,
      from: activeAccount,
    };

    transactions.push(approveHypERC20CollTx);

    const a = [zkAddress];
    console.log('pubkey %s', pubkey);

    if ((await provider.getCode(activeAccount)) === '0x') {
      a.push(pubkey);
    }

    const abiCorder = new ethers.utils.AbiCoder();
    const callData = abiCorder.encode(
      ['bytes', 'address'],
      [ethers.utils.toUtf8Bytes(zkAddress), pubkey]
    );

    const hyperlaneTxPop =
      await HypERC20Coll.populateTransaction.transferRemoteWithCalldata(
        chainID,
        utils.addressToBytes32(activeAccount),
        ethers.utils.parseEther(value),
        callData
      );

    const hyperlaneTx: EthersTransactionRequest = {
      ...hyperlaneTxPop,
      from: activeAccount,
    };

    console.log('hyperlaneTxPop: %s', JSON.stringify(hyperlaneTxPop));

    transactions.push(hyperlaneTx);

    console.log('transaction: %s', JSON.stringify(initTx));

    await backgroundDispatch(
      // transactionRequestのstateを変更する
      sendTransactionRequest({
        transactionRequest: initTx,
        origin: '',
      })
    );
    // onComplete(transaction, undefined);
    sendEth();
  };

  const sendEth = useCallback(async () => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: activeAccount,
            to: toAddress,
            data: '0x',
            value: ethers.utils.parseEther(value),
          },
        ],
      });
      console.log(txHash);
      navigate('/');
    }
  }, [activeAccount, navigate, toAddress, value]);

  return (
    <Center
      minHeight="100vh"
      height="100%"
      width="60%"
      marginX="auto"
      {...props}
    >
      <Header mb={2} />
      <BorderBox>
        <HeadTitle title="Transfer ETH" />
        <Typography marginBottom={4} width="100%" variant="body1" color="white">
          Please Enter below.
        </Typography>
        <FormGroup sx={{ width: '100%' }}>
          {/* zkAddress */}
          <FormControl sx={{ mb: 2 }} fullWidth variant="outlined">
            <FormInput
              value={zkAddress}
              onChange={(e) => setZkAddress(e.target.value)}
              placeholder="ZK Address"
            />
          </FormControl>
          {/* USDC */}
          <FormControl fullWidth variant="outlined">
            <FormInput
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="USDC"
            />
          </FormControl>
          <Button
            sx={{ marginLeft: 'auto', marginTop: 8 }}
            title="Confirm"
            onClick={changeTransaction}
            disabled={!zkAddress || !value}
            icon={
              <SendRoundedIcon
                sx={{
                  color: !zkAddress || !value ? colors.disabled : colors.white,
                }}
              />
            }
          />
        </FormGroup>
      </BorderBox>
    </Center>
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
