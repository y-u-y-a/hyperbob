import {
  Button,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { EthersTransactionRequest } from '../../../Background/services/provider-bridge';
import { TransactionComponentProps } from '../types';

// NOTE: ダミーコンポーネント本体
const Transaction = ({
  transaction,
  onComplete,
  onReject,
}: TransactionComponentProps) => {
  return (
    <>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Dummy Account Component
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You can show as many steps as you want in this dummy component. You
          need to call the function <b>onComplete</b> passed as a props to this
          component. <br />
          <br />
          The function takes a modifiedTransactions & context as a parameter,
          the context will be passed to your AccountApi when creating a new
          account. While modifiedTransactions will be agreed upon by the user.
          <br />
          This Component is defined in exported in{' '}
          <pre>
            trampoline/src/pages/Account/components/transaction/index.ts
          </pre>
        </Typography>
      </CardContent>
      <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Button
            size="large"
            variant="contained"
            onClick={() => {
              // TODO: 新しいトランザクションを作成&storeにセットする
              // TODO: ここでstoreにセットする方法を解明する
              onComplete(transaction, undefined);
            }}
          >
            Continue
          </Button>
        </Stack>
        <div>{JSON.stringify(transaction)}</div>
      </CardActions>
    </>
  );
};

export default Transaction;
