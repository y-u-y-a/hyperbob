import { Box, Button, Input, Stack } from '@mui/material';
import React, { useState } from 'react';
import { TransactionComponentProps } from '../types';
import { useBackgroundDispatch } from '../../../App/hooks';
import {
  sendTransactionRequest,
  setModifyTransactionsRequest,
} from '../../../Background/redux-slices/transactions';
import { useNavigate } from 'react-router-dom';

// NOTE: ダミーコンポーネント本体
const Transaction = ({
  transaction,
  onComplete,
  onReject,
}: TransactionComponentProps) => {
  const backgroundDispatch = useBackgroundDispatch();
  const navigate = useNavigate();
  //
  const [gkAddress, setGkAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [val, setVal] = useState('');
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
          <Button
            size="large"
            variant="contained"
            onClick={async () => {
              // TODO: 新しいトランザクションを作成
              const dummy = Array.prototype.slice.call({ 0: 'a', length: 1 });
              transaction.data = dummy;
              await backgroundDispatch(
                // transactionRequestのstateを変更する
                sendTransactionRequest({
                  transactionRequest: transaction,
                  origin: 'https://yahoo.co.jp',
                })
              );
              onComplete(transaction, undefined);
              console.log({ transaction });
              // navigate('/complete');
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Transaction;
