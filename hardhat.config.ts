// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@typechain/hardhat';
import { HardhatUserConfig, NetworksUserConfig } from 'hardhat/types';
import * as fs from 'fs';
import '@nomiclabs/hardhat-etherscan';
import './tasks/sendEth';
import { networks } from './src/exconfig.json';

const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`;
let mnemonic = 'test '.repeat(11) + 'junk';
if (fs.existsSync(mnemonicFileName)) {
  mnemonic = fs.readFileSync(mnemonicFileName, 'ascii');
}

function getNetwork1(url: string): {
  url: string;
  accounts: { mnemonic: string };
} {
  return {
    url,
    accounts: { mnemonic },
  };
}

function getNetwork(name: string): {
  url: string;
  accounts: { mnemonic: string };
} {
  return getNetwork1(`https://${name}.infura.io/v3/${process.env.INFURA_ID}`);
  // return getNetwork1(`wss://${name}.infura.io/ws/v3/${process.env.INFURA_ID}`)
}

const a = networks.map((n) => {
  return 'a';
});

// const  HttpNetworkUserConfig

const config: HardhatUserConfig = {
  defaultNetwork: 'localGoerli',
  solidity: {
    compilers: [{ version: '0.8.12', settings: {} }, { version: '0.5.0' }],
  },
  typechain: {
    outDir: 'src/pages/Account/account-api/typechain-types',
  },
  networks: {
    // goerli: getNetwork('goerli'),
    localGoerli: {
      url: 'http://localhost:8545',
    },
    localSepolia: {
      url: 'http://localhost:8546',
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
