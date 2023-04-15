import { Typography, Chip, Tooltip, BoxProps } from '@mui/material';
import React, { FC, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import {
  AccountData,
  getAccountData,
} from '../../../Background/redux-slices/account';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { getAccountEVMData } from '../../../Background/redux-slices/selectors/accountSelectors';
import { BorderBox } from '../../../../components/BorderBox';
import { Row } from '../../../../components/Row';
import balanceBg from '../../../../assets/img/balanceBg.png';
import { colors } from '../../../../config/const';

type Props = BoxProps & {
  address: string;
};

const AccountBalanceInfo: FC<Props> = ({ address, ...props }) => {
  const navigate = useNavigate();
  const backgroundDispatch = useBackgroundDispatch();
  //
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountData: AccountData | 'loading' = useBackgroundSelector((state) =>
    getAccountEVMData(state, { address, chainId: activeNetwork.chainID })
  );
  const walletDeployed: boolean = useMemo(
    () => (accountData === 'loading' ? false : accountData.accountDeployed),
    [accountData]
  );

  useEffect(() => {
    backgroundDispatch(getAccountData(address));
    // console.log({ activeNetwork });
  }, [backgroundDispatch, address]);

  if (!activeNetwork) {
    return <></>;
  }

  return (
    <BorderBox
      pt="32px"
      pb="20px"
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
          sx={{
            height: '24px',
            cursor: 'pointer',
            border: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            color: walletDeployed ? colors.success : colors.error,
            '& .css-6od3lo-MuiChip-label': { p: 0 },
            '& .MuiChip-icon': {
              ml: 0,
              mr: 0.5,
              fontSize: '18px',
              fontWeight: 'bold',
              color: walletDeployed ? colors.success : colors.error,
            },
          }}
          onClick={() => navigate('/deploy-account')}
          variant="outlined"
          icon={walletDeployed ? <CheckIcon /> : <CloseIcon />}
          label={
            accountData === 'loading'
              ? 'Loading deployment status...'
              : walletDeployed
              ? 'Deployed'
              : 'Not Deployed'
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
              lineHeight="42px"
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
            <Typography
              marginY={0}
              lineHeight="42px"
              fontSize="36px"
              variant="h6"
            >
              {activeNetwork.baseAsset.symbol}
            </Typography>
          </Row>
        )}
    </BorderBox>
  );
};

export default AccountBalanceInfo;
