import {
  BoxProps,
  FormControl,
  FormGroup,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Header from '../../components/header';
import { useBackgroundSelector } from '../../hooks';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { Center } from '../../../../components/Center';
import { BorderBox } from '../../../../components/BorderBox';
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';
import { FormInput } from '../../../../components/FormInput';
import { colors } from '../../../../config/const';

type Props = BoxProps & {};

export const TransferForm: FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  const [toAddress, setToAddress] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const activeAccount = useBackgroundSelector(getActiveAccount);

  const sendEth = useCallback(async () => {
    if (!ethers.utils.isAddress(toAddress)) {
      setError('Invalid to address');
      return;
    }
    setError('');

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
          {/* To */}
          <FormControl sx={{ mb: 2 }} fullWidth variant="outlined">
            <FormInput
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Send to"
            />
          </FormControl>
          {/* Value */}
          <Stack
            spacing={2}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <FormControl fullWidth variant="outlined">
              <FormInput
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={{
                      '& .css-1pnmrwp-MuiTypography-root': {
                        color: colors.placeholder,
                      },
                    }}
                    children="ETH"
                  />
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Value"
              />
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <FormInput
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={{
                      '& .css-1pnmrwp-MuiTypography-root': {
                        color: colors.placeholder,
                      },
                    }}
                    children="USDC"
                  />
                }
                sx={{ color: colors.white }}
                value="2000"
                disabled={true}
              />
            </FormControl>
          </Stack>
          {/* Error */}
          {error && (
            <Typography variant="body1" color="error" children={error} />
          )}

          <Button
            sx={{ marginLeft: 'auto', marginTop: 8 }}
            title="Confirm"
            onClick={sendEth}
            disabled={!toAddress}
            icon={
              <SendRoundedIcon
                sx={{ color: !toAddress ? colors.disabled : colors.white }}
              />
            }
          ></Button>
        </FormGroup>
      </BorderBox>
    </Center>
  );
};
