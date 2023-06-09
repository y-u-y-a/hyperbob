import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { address, domain, gas } from '../utils/index';
import { HypERC20Collateral__factory } from '../src/pages/Account/account-api/typechain-types';
import { ethers } from 'hardhat';

async function main() {
  const chainId = await ethers.provider
    .getNetwork()
    .then((network) => network.chainId);
  if (chainId != 5) {
    return;
  }

  const [signer] = await ethers.getSigners();
  console.log('signer address: %s', await signer.getAddress());

  const factory = new HypERC20Collateral__factory(signer);
  const hyperERC20Coll = await factory.deploy(
    address.goerli.BOB,
    gas.DEST_GAS_AMOUNT
  );

  console.log('HypERC20Collateral Address: ', hyperERC20Coll.address);
  const tx = await hyperERC20Coll.initialize(
    address.goerli.mailbox,
    address.goerli.defaultIsmInterchainGasPaymaster,
    { gasLimit: gas.DEST_GAS_AMOUNT }
  );
  const recepit = await tx.wait();
  console.log('tx hash for initialize(): ', recepit.transactionHash);

  address.goerli.hypERCCollateral = hyperERC20Coll.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// signer address: 0x4E78EA99404a4A933bDcE96aF6b9D592C9E16F33
// HypERC20Collateral Address:  0xd06532148869ba2fdb1af29c79ba79002a833be0 on
// tx hash for initialize():  0x244b23e5fb383f25dc3248d7582acc86cdfb3163b4a6c2cfd9563fa8bb575720
