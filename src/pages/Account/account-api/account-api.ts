import { BigNumber, BigNumberish, ethers, Wallet } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { arrayify, hexConcat } from 'ethers/lib/utils';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import config from '../../../exconfig.json';
import {
  Account,
  Account__factory,
  AccountFactory,
  AccountFactory__factory,
  HypERC20Collateral__factory,
} from './typechain-types';
import { DeterministicDeployer } from '@account-abstraction/sdk';

// const FACTORY_ADDRESS =
//   config.factory_address || '0x45df9144d755454f49ddea143e9698da9ffa07f0';

/**
 * An implementation of the BaseAccountAPI using the Account contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
class AccountAPI extends AccountApiType {
  name: string;
  factoryAddress?: string;
  owner: Wallet;
  index: number;
  hypERC20CollateralGasAmount: BigNumberish = BigNumber.from('500000');
  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  accountContract?: Account;

  factory?: AccountFactory;

  constructor(params: AccountApiParamsType<{}>) {
    super(params);

    this.factoryAddress = DeterministicDeployer.getDeterministicDeployAddress(
      new AccountFactory__factory(),
      0,
      [this.entryPointAddress]
    );

    this.owner = new ethers.Wallet(
      '0xe6acd6693c0d5e4753e274fafdf43ce0b0b5d31524a6dee80f09175adef62677'
    );

    // const wallet = ethers.Wallet.createRandom();
    // console.log('private key: %s', wallet.privateKey);
    // console.log('public key: %s', wallet.publicKey);
    // this.owner = wallet;
    // this.owner = params.deserializeState?.privateKey
    //   ? new ethers.Wallet(params.deserializeState?.privateKey)
    //   : ethers.Wallet.createRandom();
    this.index = 0;
    this.name = 'AccountAPI';
  }

  serialize = async (): Promise<object> => {
    return {
      privateKey: this.owner.privateKey,
    };
  };

  async _getAccountContract(): Promise<Account> {
    if (this.accountContract == null) {
      this.accountContract = Account__factory.connect(
        await this.getAccountAddress(),
        this.provider
      );
    }
    return this.accountContract;
  }

  async getAccountWalletPubkey(): Promise<string> {
    return await this.owner.getAddress();
  }

  /**
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<string> {
    const pk = await this.serialize();
    console.log(pk);
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== '') {
        this.factory = AccountFactory__factory.connect(
          this.factoryAddress,
          this.provider
        );
      } else {
        throw new Error('no factory to get initCode');
      }
    }

    return hexConcat([
      this.factory.address,
      this.factory.interface.encodeFunctionData('createAccount', [
        await this.owner.getAddress(),
        0,
      ]),
    ]);
  }

  async getNonce(): Promise<BigNumber> {
    if (await this.checkAccountPhantom()) {
      return BigNumber.from(0);
    }
    const accountContract = await this._getAccountContract();
    return await accountContract.nonce();
  }

  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute(
    target: string,
    value: BigNumberish,
    data: string
  ): Promise<string> {
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData('execute', [
      target,
      value,
      data,
    ]);
  }

  async signUserOpHash(userOpHash: string): Promise<string> {
    return await this.owner.signMessage(arrayify(userOpHash));
  }

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    return this.owner.signMessage(request?.rawSigningData || '');
  };

  signUserOpWithContext = async (
    userOp: UserOperationStruct,
    context: any
  ): Promise<UserOperationStruct> => {
    return {
      ...userOp,
      signature: await this.signUserOpHash(await this.getUserOpHash(userOp)),
    };
  };
}

export default AccountAPI;
