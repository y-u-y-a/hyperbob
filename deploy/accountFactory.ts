import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { AccountFactory__factory } from '../src/pages/Account/account-api/typechain-types';
import { DeterministicDeployer } from '@account-abstraction/sdk';

const func: DeployFunction = async function ({
  ethers,
}: HardhatRuntimeEnvironment) {
  const factory = new AccountFactory__factory();
  const dep = new DeterministicDeployer(ethers.provider);

  const addr = await dep.deterministicDeploy(factory, 0, [
    '0x0576a174D229E3cFA37253523E645A78A0C91B57',
  ]);
  console.log('AccountFactory Address: ', addr);
};

export default func;
