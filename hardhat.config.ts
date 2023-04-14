// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@typechain/hardhat';
import { HardhatUserConfig, HttpNetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-etherscan';
import './tasks/sendEth';
import exconfigJson from './src/exconfig.json';
import '@typechain/ethers-v5';

const networks: { [networkName: string]: HttpNetworkUserConfig } = {};
exconfigJson.networks.map(({ name, provider }) => {
  networks[name] = {};
  return (networks[name].url = provider);
});

// const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`;
// let mnemonic = 'test '.repeat(11) + 'junk';
// if (fs.existsSync(mnemonicFileName)) {
//   mnemonic = fs.readFileSync(mnemonicFileName, 'ascii');
// }

const config: HardhatUserConfig = {
  networks: {
    ...networks,
    // goerli: {
    //   url: 'https://eth-goerli.g.alchemy.com/v2/-GlnUSi8Q2ADFXvSTgCvIHMEo8sbb0s6',
    //   // accounts: accounts,
    // },
    // hardhat: {
    //   forking: {
    //     url: 'https://eth-goerli.g.alchemy.com/v2/-GlnUSi8Q2ADFXvSTgCvIHMEo8sbb0s6',
    //   },
    // },
  },
  defaultNetwork: 'LocalGoerli',
  solidity: {
    compilers: [{ version: '0.8.12', settings: {} }, { version: '0.5.0' }],
  },
  typechain: {
    outDir: 'src/pages/Account/account-api/typechain-types',
    target: 'ethers-v5',
    externalArtifacts: [
      './node_modules/@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json',
      './node_modules/@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json',
      './node_modules/@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json',
      './node_modules/@openzeppelin/contracts/build/contracts/ERC20.json',
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
