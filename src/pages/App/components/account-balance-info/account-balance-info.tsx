import { Typography, Chip, Tooltip, BoxProps } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BorderBox } from '../../../../components/BorderBox';
import { Row } from '../../../../components/Row';
import balanceBg from '../../../../assets/img/balanceBg.png';
import {
  AccountData,
  getAccountData,
} from '../../../Background/redux-slices/account';
import { getAccountEVMData } from '../../../Background/redux-slices/selectors/accountSelectors';

type Props = BoxProps & {
  address: string;
};

const AccountBalanceInfo = ({ address, ...props }: BoxProps & {address: any}) => {
  const navigate = useNavigate();
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountData: AccountData | 'loading' = useBackgroundSelector((state) =>
    getAccountEVMData(state, { address, chainId: activeNetwork.chainID })
  );

  const walletDeployed: boolean = useMemo(
    () => (accountData === 'loading' ? false : accountData.accountDeployed),
    [accountData]
  );

  const backgroundDispatch = useBackgroundDispatch();

  useEffect(() => {
    backgroundDispatch(getAccountData(address));
  }, [backgroundDispatch, address]);

  if (!activeNetwork) {
    return <></>;
  }

  return (
    <BorderBox
      py={2}
      sx={{
        backgroundImage: `url(${balanceBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      <Typography marginBottom={18} fontSize="32px" variant="h6">
        Balance
      </Typography>
      {/* deploy */}
      <Tooltip
        title={
          walletDeployed
            ? `Wallet has been deployed on ${activeNetwork.name} chain`
            : `Wallet is not deployed on ${activeNetwork.name} chain, it will be deployed upon the first transaction`
        }
      >
        <Chip
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/deploy-account')}
          variant="outlined"
          color={walletDeployed ? 'success' : 'error'}
          size="small"
          icon={walletDeployed ? <CheckCircleIcon /> : <CancelIcon />}
          label={
            accountData === 'loading'
              ? 'Loading deployment status...'
              : walletDeployed
              ? 'Deployed'
              : 'Not deployed'
          }
        />
      </Tooltip>
      {/* ETH */}
      {accountData !== 'loading' &&
        accountData.balances &&
        accountData.balances[activeNetwork.baseAsset.symbol] && (
          <Row>
            <Typography
              marginY={0}
              marginRight={1}
              fontSize="42px"
              fontWeight="bold"
              variant="h6"
              noWrap
            >
              {
                accountData.balances[activeNetwork.baseAsset.symbol].assetAmount
                  .amount
              }
            </Typography>
            <Typography marginY={0} fontSize="36px" variant="h6">
              {activeNetwork.baseAsset.symbol}
            </Typography>
          </Row>
        )}
    </BorderBox>
  );
};

export default AccountBalanceInfo;
