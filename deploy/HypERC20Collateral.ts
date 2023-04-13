import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { address, domain, gas } from '../utils/index';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { HypERC20Collateral__factory } from '../src/pages/Account/account-api/typechain-types';

const func: DeployFunction = async function ({
  ethers,
  network,
}: HardhatRuntimeEnvironment) {
  const chainId = await ethers.provider
    .getNetwork()
    .then((network) => network.chainId);
  if (chainId != 5) {
    return;
  }

  const [signer] = await ethers.getSigners();
  const factory = new HypERC20Collateral__factory(signer);

  const dep = new DeterministicDeployer(ethers.provider);
  const hyperc20CollAddr = DeterministicDeployer.getDeterministicDeployAddress(
    factory,
    0,
    [address.goerli.bob, gas.GAS_AMOUNT]
  );

  if (await dep.isContractDeployed(hyperc20CollAddr)) {
    return;
  }

  dep.deterministicDeploy(factory, 0, [address.goerli.bob, gas.GAS_AMOUNT]);
  const hyperc20Coll = factory.attach(hyperc20CollAddr);

  console.log(
    'HypERC20Collateral Address: ',
    hyperc20Coll.address,
    'on',
    network.name
  );

  const tx = await hyperc20Coll.initialize(
    address.goerli.mailbox,
    address.goerli.defaultIsmInterchainGasPaymaster,
    { gasLimit: gas.GAS_LIMIT }
  );

  const recepit = await tx.wait();
  console.log('tx hash for initialize(): ', recepit.transactionHash);
};

export default func;
