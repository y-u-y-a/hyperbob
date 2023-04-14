import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { HyperBOBStorage__factory } from '../src/pages/Account/account-api/typechain-types';

const func: DeployFunction = async function ({
  ethers,
}: HardhatRuntimeEnvironment) {
  const [signer] = await ethers.getSigners();

  const factory = new HyperBOBStorage__factory(signer);
  const dep = new DeterministicDeployer(ethers.provider);

  const addr = await dep.deterministicDeploy(factory, 0, [0]);
  console.log('HyperBOBStorage Address: ', addr);
};

export default func;
