// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { DeployFunction } from 'hardhat-deploy/types';
// import { DeterministicDeployer } from '@account-abstraction/sdk';
import {} from '../src/pages/Account';
import { ethers } from 'hardhat';
import { AccountFactory__factory } from '../src/pages/Account/account-api/typechain-types';
import { address } from '../src/utils/address';

async function main() {
  const [signer] = await ethers.getSigners();

  const factory = new AccountFactory__factory(signer);
  const accountFactory = await factory.deploy(
    '0x0576a174D229E3cFA37253523E645A78A0C91B57'
  );

  console.log('AccountFactory Address: ', accountFactory.address);
  console.log(
    'Account Imp Address: ',
    await accountFactory.callStatic.accountImplementation()
  );

  const { chainId } = await ethers.provider.getNetwork();
  if (chainId == 5) {
    address.goerli.accountFactory = accountFactory.address;
  }
  if (chainId == 11155111) {
    address.sepolia.accountFactory = accountFactory.address;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
