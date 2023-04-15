import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import {} from '../src/pages/Account';
import { ethers } from 'hardhat';

async function main() {
  const factory = await ethers.getContractFactory('AccountFactory');
  const dep = new DeterministicDeployer(ethers.provider);
  const addr = await dep.deterministicDeploy(factory, 0, [
    '0x0576a174D229E3cFA37253523E645A78A0C91B57',
  ]);

  console.log('AccountFactory Address: ', addr);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
