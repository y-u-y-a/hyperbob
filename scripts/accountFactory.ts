// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { DeployFunction } from 'hardhat-deploy/types';
// import { DeterministicDeployer } from '@account-abstraction/sdk';
import {} from '../src/pages/Account';
import { ethers } from 'hardhat';
import { AccountFactory__factory } from '../src/pages/Account/account-api/typechain-types';
import { address } from '../src/utils/address';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { providers } from 'ethers';

async function main() {
  const [signer] = await ethers.getSigners();
  const factory = new AccountFactory__factory(signer);

  const dep = new DeterministicDeployer(ethers.provider);
  const accountFactoryAddr = await dep.deterministicDeploy(factory, 0, [
    '0x0576a174D229E3cFA37253523E645A78A0C91B57',
  ]);

  const accountFactroy = factory.attach(accountFactoryAddr);

  console.log('AccountFactory Address: ', accountFactoryAddr);
  console.log(
    'Account Imp Address: ',
    await accountFactroy.callStatic.accountImplementation()
  );

  const { chainId } = await ethers.provider.getNetwork();
  if (chainId == 5) {
    address.goerli.accountFactory = accountFactroy.address;
  }
  if (chainId == 11155111) {
    address.sepolia.accountFactory = accountFactroy.address;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
