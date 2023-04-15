import { ethers } from 'hardhat';
import { HypERC20__factory } from '../src/pages/Account/account-api/typechain-types';
import { address, gas } from '../utils';
import { utils } from '@hyperlane-xyz/utils';

async function main() {
  const [signer] = await ethers.getSigners();
  const factory = new HypERC20__factory(signer);

  const hyperBOB = factory.attach(address.sepolia.hypERC);

  const initTx = await hyperBOB.initialize(
    address.sepolia.accountFactory,
    address.sepolia.mailbox,
    address.sepolia.defaultIsmInterchainGasPaymaster,
    { gasLimit: gas.GAS_LIMIT }
  );

  const recepit1 = await initTx.wait();
  console.log('tx hash for initialize(): ', recepit1.transactionHash);

  const enrollTx = await hyperBOB.enrollRemoteRouter(
    5,
    utils.addressToBytes32(address.goerli.hypERCCollateral)
  );

  console.log('tx hash for enrollRemoteRouter(): ', enrollTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
