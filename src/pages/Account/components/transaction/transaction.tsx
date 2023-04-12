import { Box, Button, Input, Stack } from '@mui/material';
import React, { FC, useState } from 'react';

import { TransactionComponentProps as Props } from '../types';
import { useBackgroundDispatch } from '../../../App/hooks';
import { sendTransactionRequest } from '../../../Background/redux-slices/transactions';
import { ethers } from 'ethers';

// NOTE: This is Costomize component
const Transaction: FC<Props> = ({ transaction, onComplete }) => {
  const backgroundDispatch = useBackgroundDispatch();
  //
  const [gkAddress, setGkAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [val, setVal] = useState('');
  //
  const changeTransaction = async () => {
    // TODO: 新しいトランザクションを作成をすれば確認画面へ遷移する
    transaction.to = tokenAddress;
    transaction.value = ethers.utils.parseEther(val);

    await backgroundDispatch(
      // transactionRequestのstateを変更する
      sendTransactionRequest({
        transactionRequest: transaction,
        origin: '',
      })
    );
    onComplete(transaction, undefined);
    console.log({ transaction });
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <h3 style={{ margin: '20px auto', fontSize: '20px', fontWeight: 'bold' }}>Enter a destination address</h3>
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

export default Transaction;
