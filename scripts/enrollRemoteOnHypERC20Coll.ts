import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { address, domain, gas } from '../utils/index';
import { DeterministicDeployer } from '@account-abstraction/sdk';
import { utils } from '@hyperlane-xyz/utils';
import { HypERC20Collateral__factory } from '../src/pages/Account/account-api/typechain-types';
import { ethers } from 'hardhat';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20.json';

async function main() {
  const signer = (await ethers.getSigners())[0];
  const hypERC20Collateral = HypERC20Collateral__factory.getContract(
    address.goerli.hypERCCollateral,
    HypERC20Collateral__factory.abi,
    signer
  );

  const router = await hypERC20Collateral.callStatic.routers(domain.sepolia);

  if (utils.bytes32ToAddress(router) != address.sepolia.hypERC) {
    const remoteRouter = utils.addressToBytes32(address.sepolia.hypERC);
    const tx = await hypERC20Collateral.enrollRemoteRouter(
      domain.sepolia,
      remoteRouter
    );
    const receipt = await tx.wait();
    console.log('tx hash for enrollRemoteRouter() : ', receipt.transactionHash);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
