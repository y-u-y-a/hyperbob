import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { address, domain, gas } from '../utils/index';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { HypERC20__factory } from '../src/pages/Account/account-api/typechain-types';
import { utils } from '@hyperlane-xyz/utils';
import { ethers } from 'hardhat';

async function main() {
  const [signer] = await ethers.getSigners();

  const factory = new HypERC20__factory(signer);
  const dep = new DeterministicDeployer(ethers.provider);

  const hyperBOBAddr = await dep.deterministicDeploy(factory, 0, [
    'hypBOB',
    'hWBOB',
    [],
    address.sepolia.BOB,
    gas.GAS_AMOUNT,
  ]);

  if (await dep.isContractDeployed(hyperBOBAddr)) {
    console.log('hyperBOB alreadey deployed on %s', hyperBOBAddr);
    return;
  }

  const hyperBOB = factory.attach(hyperBOBAddr);

  console.log('hyperBOBAddress: ', hyperBOBAddr, 'on');

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

  const recepit2 = await enrollTx.wait();
  console.log('tx hash for enrollRemoteRouter(): ', recepit2.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
