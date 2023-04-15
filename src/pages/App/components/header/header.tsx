import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, BoxProps, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';

import { getActiveNetwork, getSupportedNetworks } from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import { setActiveNetwork } from '../../../Background/redux-slices/network';
import { Row } from '../../../../components/Row';
import logo from '../../../../assets/img/logo.svg';
import { colors } from '../../../../config/const';

type Props = BoxProps & {};

const Header = ({ ...props }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const supportedNetworks = useBackgroundSelector(getSupportedNetworks);

  const changeNetwork = (e: SelectChangeEvent<string>) => {
    const payload = supportedNetworks.find((network) => {
      return network.chainID === e.target.value;
    });
    if (!payload) return;
    dispatch(setActiveNetwork(payload));
  };

  return (
    <Row width="100%" justifyContent="space-between" {...props}>
      {/* Logo */}
      <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img height={32} src={logo} className="App-logo" alt="logo" />
      </Box>
      {/* Switch Chain */}
      <FormControl sx={{ minWidth: 80, color: colors.white }}>
        <InputLabel
          id="chain-selector"
          children="Chain"
          sx={{ color: colors.gray }}
        />
        <Select
          labelId="chain-selector"
          id="chain-selector"
          value={activeNetwork.chainID}
          label="Chain"
          onChange={changeNetwork}
          sx={{
            color: colors.white,
            '& label': {
              color: `${colors.gray} !important`,
            },
            '& label.Mui-focused': {
              color: `${colors.gray} !important`,
            },
            '& fieldset': {
              outline: 'none',
              borderColor: `${colors.gray} !important`,
            },
            '& svg': {
              color: colors.white,
            },
            '&:hover fieldset': {},
          }}
        >
          {supportedNetworks.map((network) => (
            <MenuItem key={network.chainID} value={network.chainID}>
              {network.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Row>
  );
};

export default Header;
