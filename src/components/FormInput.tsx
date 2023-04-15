import { OutlinedInputProps, OutlinedInput } from '@mui/material';
import React, { FC } from 'react';
import { colors } from '../config/const';

export const FormInput: FC<OutlinedInputProps> = ({ sx, ...props }) => {
  return (
    <OutlinedInput
      autoFocus={false}
      id="name"
      type="text"
      sx={{
        color: colors.white,
        '& label': {
          color: colors.white,
        },
        '& input[placeholder=*]': {
          color: `${colors.white} !important`,
        },
        '& input': {
          outline: 'none',
        },
        '& fieldset': {
          outline: 'none',
          borderColor: `${colors.gray} !important`,
        },
        '&:hover fieldset': {},
        ...sx,
      }}
      {...props}
    />
  );
};
