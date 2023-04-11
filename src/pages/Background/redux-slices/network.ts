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

const Networks: EVMNetwork[] = Config.networks;

export const initialState: NetworkState = {
  activeNetwork: Networks[0],
  supportedNetworks: Networks,
};

type NetworkReducers = {};

const networkSlice = createSlice<NetworkState, NetworkReducers, 'network'>({
  name: 'network',
  initialState,
  reducers: {},
});

export default networkSlice.reducer;
