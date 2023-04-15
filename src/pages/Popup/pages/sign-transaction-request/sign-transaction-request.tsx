import { UserOperationStruct } from '@account-abstraction/contracts';
import { Box, Stack, Typography } from '@mui/material';
import { ethers } from 'ethers';
import React, { FC, useCallback, useState } from 'react';
import {
  AccountImplementations,
  ActiveAccountImplementation,
} from '../../../App/constants';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import {
  getAccountInfo,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { selectCurrentOriginPermission } from '../../../Background/redux-slices/selectors/dappPermissionSelectors';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import {
  selectCurrentPendingSendTransactionRequest,
  selectCurrentPendingSendTransactionsRequest,
  selectCurrentPendingSendTransactionUserOp,
} from '../../../Background/redux-slices/selectors/transactionsSelectors';
import {
  createUnsignedUserOp,
  rejectTransaction,
  sendTransaction,
  // setUnsignedUserOperation,
} from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import AccountInfo from '../../components/account-info';
import Config from '../../../../exconfig';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { RejectButton } from '../../../../components/RejectButton';

const SignTransactionComponent =
  AccountImplementations[ActiveAccountImplementation].Transaction;

type Props = {
  activeNetwork: any;
  activeAccount: any;
  accountInfo: any;
  originPermission: any;
  transactions: EthersTransactionRequest[];
  userOp: UserOperationStruct;
  onReject: any;
  onSend: any;
};

/** 送金内容の確認コンポーネント */
const SignTransactionConfirmation: FC<Props> = ({
  activeNetwork,
  activeAccount,
  accountInfo,
  transactions,
  onReject,
  onSend,
}) => {
  return (
    <Box px={2} color="white">
      <Typography
        my={4}
        fontSize="28px"
        fontWeight="bold"
        children="Send Transaction Request"
      />
      {activeAccount && (
        <AccountInfo activeAccount={activeAccount} accountInfo={accountInfo} />
      )}
      <Stack spacing={2} sx={{ position: 'relative', pt: 2, mb: 4 }}>
        {/* Transactions Data */}
        <Typography
          mt={2}
          fontSize="24px"
          fontWeight="bold"
          children={
            transactions.length > 1 ? ' Transactions Data' : 'Transaction Data'
          }
        />
        <Stack spacing={2}>
          {transactions.map((transaction: EthersTransactionRequest, index) => (
            <BorderBox p={2} key={index}>
              <Typography mb={1} fontSize="14px">
                To{' '}
                <Typography fontWeight="bold" noWrap>
                  {transaction.to}
                </Typography>
              </Typography>
              <Typography mb={1} fontSize="14px">
                Data{' '}
                <Typography fontWeight="bold">
                  {transaction.data?.toString()}
                </Typography>
              </Typography>
              <Typography mb={1} fontSize="14px">
                Value{' '}
                <Typography fontWeight="bold">
                  {transaction.value
                    ? ethers.utils.formatEther(transaction.value)
                    : 0}{' '}
                  {activeNetwork.baseAsset.symbol}
                </Typography>
              </Typography>
            </BorderBox>
          ))}
        </Stack>
      </Stack>
      <Stack
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <RejectButton fullWidth title="Reject" onClick={onReject} />
        <Box width="32px" />
        <Button fullWidth title="Send" onClick={onSend} />
      </Stack>
    </Box>
  );
};

const SignTransactionRequest = () => {
  const [stage, setStage] = useState<
    'custom-account-screen' | 'sign-transaction-confirmation'
  >('custom-account-screen');

  const [context, setContext] = useState(null);

  const backgroundDispatch = useBackgroundDispatch();
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const sendTransactionRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionRequest
  );

  const sendTransactionsRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionsRequest
  );

  const pendingUserOp = useBackgroundSelector(
    selectCurrentPendingSendTransactionUserOp
  );

  const originPermission = useBackgroundSelector((state) =>
    selectCurrentOriginPermission(state, {
      origin: sendTransactionRequest?.origin || '',
      address: activeAccount || '',
    })
  );

  const onSend = useCallback(
    async (_context?: any) => {
      // TODO: _contextのオブジェクトをJSONパースしてもエラーとなる
      // nverting circular structure to JSON
      console.log({ activeAccount });
      console.log({ _context });
      console.log({ context });
      if (activeAccount)
        await backgroundDispatch(
          sendTransaction({
            address: activeAccount,
            context: JSON.parse(JSON.stringify(_context)) || context,
          })
        );
      window.close();
    },
    [activeAccount, backgroundDispatch, context]
  );

  // TODO: ここでUserOPが作成されているか確認する
  const onComplete = useCallback(
    async (modifiedTransaction: EthersTransactionRequest, context?: any) => {
      if (activeAccount) {
        // NOTE: bundlerに送るユーザーオペレーションを作成している
        backgroundDispatch(createUnsignedUserOp(activeAccount));
        setContext(context);
        if (Config.showTransactionConfirmationScreen === false) {
          onSend(context);
        }
        setStage('sign-transaction-confirmation');
      }
    },
    [setContext, setStage, activeAccount, backgroundDispatch, onSend]
  );

  const onReject = useCallback(async () => {
    if (activeAccount)
      await backgroundDispatch(rejectTransaction(activeAccount));
    window.close();
  }, [backgroundDispatch, activeAccount]);

  console.log({ pendingUserOp });
  console.log('req', sendTransactionsRequest.transactionsRequest);

  // TODO: pendingUserOp=undefinedなので確認画面へ遷移できない
  if (
    stage === 'sign-transaction-confirmation' &&
    pendingUserOp &&
    sendTransactionsRequest.transactionsRequest
    // sendTransactionRequest.transactionRequest
  )
    return (
      <SignTransactionConfirmation
        activeNetwork={activeNetwork}
        activeAccount={activeAccount}
        accountInfo={accountInfo}
        originPermission={originPermission}
        onReject={onReject}
        onSend={onSend}
        transactions={sendTransactionsRequest.transactionsRequest || []}
        userOp={pendingUserOp}
      />
    );

  return SignTransactionComponent &&
    sendTransactionRequest.transactionRequest ? (
    <SignTransactionComponent
      onReject={onReject}
      transaction={sendTransactionRequest.transactionRequest}
      onComplete={onComplete}
    />
  ) : null;
};

export default SignTransactionRequest;
