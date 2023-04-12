import { createSlice } from '@reduxjs/toolkit';
import { EVMNetwork } from '../types/network';
import Config from '../../../exconfig.json';

export type Vault = {
  vault: string;
  encryptionKey?: string;
  encryptionSalt?: string;
};

export type NetworkState = {
  activeNetwork: EVMNetwork;
  supportedNetworks: Array<EVMNetwork>;
};

const Networks: EVMNetwork[] = JSON.parse(JSON.stringify(Config.networks));

export const initialState: NetworkState = {
  activeNetwork: Networks[0],
  supportedNetworks: Networks,
};

type NetworkReducers = {
  setActiveNetwork: (state: NetworkState, { payload }: { payload: EVMNetwork }) => void;
};

const networkSlice = createSlice<NetworkState, NetworkReducers, 'network'>({
  name: 'network',
  initialState,
  reducers: {
    setActiveNetwork: (state, { payload }) => {
      state.activeNetwork = payload;
    },
  },
});

export const { setActiveNetwork } = networkSlice.actions;
export default networkSlice.reducer;
