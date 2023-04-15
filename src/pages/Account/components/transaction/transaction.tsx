import React, { FC, useEffect } from 'react';
import { useBackgroundDispatch } from '../../../App/hooks';
import { sendTransactionsRequest } from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import { TransactionComponentProps } from '../types';

type Props = TransactionComponentProps & {};

// TODO: ここにTransactionsを変更する処理(HyperBobTransactionでやっていた処理)を実装してほしい、フォームが/App/pages/transfer-form/transfer-form.tsxに移動している
const Transaction: FC<Props> = ({ transaction, onComplete }) => {
  const backgroundDispatch = useBackgroundDispatch();
  // // transactionRequestのstateを変更する
  useEffect(() => {
    console.log({ transaction });
    const transactions: EthersTransactionRequest[] = [];
    const init = async () => {
      await backgroundDispatch(
        sendTransactionsRequest({
          transactionsRequest: [...transactions, transaction],
          origin: '',
        })
      );
    };
    init();
    onComplete(transaction, undefined);
    // TODO: transactionをwatchすると無限ループしてしまう
  }, [backgroundDispatch, onComplete, transaction]);

  return <></>;
};

export default Transaction;
