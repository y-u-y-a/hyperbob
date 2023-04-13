import { Box, Button, Input, Stack } from '@mui/material';
import React, { FC, useState } from 'react';

import { TransactionComponentProps as Props } from '../types';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { sendTransactionsRequest } from '../../../Background/redux-slices/transactions';
import { ethers } from 'ethers';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import config from '../../../../exconfig.json';
import { gas } from '../../../../../utils/index';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { Provider } from 'react-redux';
import { HypERC20Collateral__factory } from '../../account-api/typechain-types';
import {
  getActiveAccount,
  getAccountInfo,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { utils } from '@hyperlane-xyz/utils';
import { EthersTransactionRequest } from '../../../Background/services/types';

const chainID = '11155111';

// NOTE: This is Costomize component
export const HyperBobTransaction: FC<Props> = ({ transaction, onComplete }) => {
  const backgroundDispatch = useBackgroundDispatch();

  const [gkAddress, setGkAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [val, setVal] = useState('');
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const activeAccount = useBackgroundSelector(getActiveAccount);

  const changeTransaction = async () => {
    // TODO: 新しいトランザクションを作成をすれば確認画面へ遷移する

    const provider = new ethers.providers.JsonRpcProvider(
      activeNetwork.provider
    );
    console.log('chainID: ', activeNetwork.chainID);

    const HypERC20CollFactory = new HypERC20Collateral__factory();

    const dep = new DeterministicDeployer(provider);
    const HypERC20CollAddr =
      DeterministicDeployer.getDeterministicDeployAddress(
        HypERC20CollFactory,
        0,
        [tokenAddress, gas.GAS_LIMIT]
      );

    if (!(await dep.isContractDeployed(HypERC20CollAddr))) {
      // thowError
      console.log('ないよ！！', HypERC20CollAddr);
      // tokenAddressに対応したブリッジがないよ
    }

    const HypERC20 = HypERC20CollFactory.attach(HypERC20CollAddr);

    console.log(chainID, activeAccount, tokenAddress);

    const transactions: EthersTransactionRequest[] = [];

    const hyperlaneTxPop =
      await HypERC20.populateTransaction.transferRemoteWithCalldata(
        chainID,
        utils.addressToBytes32(activeAccount),
        tokenAddress,
        '0xfba320e4aa081e27ee315b5e696df5ce6a8dd665235fb732c23c9817e3945cd6'
      );

    const tx = Object.assign(transaction, hyperlaneTxPop);

    // console.log('hyperlaneTxPop: %s', JSON.stringify(hyperlaneTxPop));

    transactions.push(tx);

    console.log('transaction: %s', JSON.stringify(transaction));

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

export default HyperBobTransaction;
