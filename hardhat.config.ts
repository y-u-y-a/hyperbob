// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@typechain/hardhat';
import { HardhatUserConfig, HttpNetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-etherscan';
import './tasks/sendEth';
import exconfigJson from './src/exconfig.json';
import '@typechain/ethers-v5';
import * as dotenv from 'dotenv';
dotenv.config();
const accounts = [process.env.PRIVATE_KEY as string];

const networks: { [networkName: string]: HttpNetworkUserConfig } = {};
exconfigJson.networks.map(({ name, provider }) => {
  networks[name] = {};
  // if
  if (!name.includes('Local')) {
    networks[name].accounts = accounts;
  }
  return (networks[name].url = provider);
});

const config: HardhatUserConfig = {
  networks: {
    ...networks,
  },
  defaultNetwork: 'Goerli',
  solidity: {
    compilers: [{ version: '0.8.12', settings: {} }, { version: '0.5.0' }],
  },
  typechain: {
    outDir: 'src/pages/Account/account-api/typechain-types',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
