import { Box, BoxProps, Tooltip, Typography } from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { getAccountInfo } from '../../../Background/redux-slices/selectors/accountSelectors';
import { useBackgroundSelector } from '../../hooks';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { Row } from '../../../../components/Row';
import { BorderBox } from '../../../../components/BorderBox';
import { colors } from '../../../../config/const';

type Props = BoxProps & {
  address: string;
  showOptions: boolean;
};

const AccountInfo: FC<Props> = ({ address, showOptions = true, ...props }) => {
  const [tooltipMessage, setTooltipMessage] = useState<string>('Copy address');

  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, address)
  );

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    setTooltipMessage('copied!');
  }, [address]);

  return (
    <BorderBox py={2} {...props}>
      <Row justifyContent="space-between">
        <Box>
          {/* Name */}
          <Typography variant="h6" lineHeight="28px">
            {accountInfo.name}
          </Typography>
          {/* Address */}
          <Tooltip title={tooltipMessage}>
            <Box
              onClick={copyAddress}
              sx={{
                fontSize: 16,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            >
              {address.substring(0, 8)}...
              {address.substring(address.length - 5)}
              <ContentCopyIcon sx={{ height: 14, cursor: 'pointer' }} />
            </Box>
          </Tooltip>
        </Box>
        <Tooltip title="Coming soon ...">
          <SettingsIcon fontSize="large" sx={{ color: colors.disabled }} />
        </Tooltip>
      </Row>
    </BorderBox>
  );
};

export default AccountInfo;
