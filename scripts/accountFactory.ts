// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { DeployFunction } from 'hardhat-deploy/types';
// import { DeterministicDeployer } from '@account-abstraction/sdk';
import {} from '../src/pages/Account';
import { ethers } from 'hardhat';
import { AccountFactory__factory } from '../src/pages/Account/account-api/typechain-types';

async function main() {
  const [signer] = await ethers.getSigners();
  const factory = new AccountFactory__factory(signer);
  const accountFactory = await factory.deploy(
    '0x0576a174D229E3cFA37253523E645A78A0C91B57'
  );

  console.log('AccountFactory Address: ', accountFactory.address);
  console.log('Account Imp Address: ', await accountFactory.callStatic.accountImplementation())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
