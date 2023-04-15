import { address, domain, gas } from '../utils/index';
import { HypERC20__factory } from '../src/pages/Account/account-api/typechain-types';
import { ethers } from 'hardhat';

async function main() {
  const [signer] = await ethers.getSigners();

  const factory = new HypERC20__factory(signer);
  const hyperBOBFactory = await factory.deploy(
    'hypBOB',
    'hWBOB',
    [],
    address.sepolia.BOB,
    gas.GAS_AMOUNT
  );

  address.sepolia.hypERC = hyperBOBFactory.address;
  console.log('hyperBOBAddress: ', hyperBOBFactory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
