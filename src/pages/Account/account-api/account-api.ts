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
  // sepolia
  zkBOBPool: string = '0x3bd088c19960a8b5d72e4e01847791bd0dd1c9e6';
  zkBobQueue: string = '0xE3Dd183ffa70BcFC442A0B9991E682cA8A442Ade';
  // goerli
  zkBobToken: string = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8';
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

    this.owner = params.deserializeState?.privateKey
      ? new ethers.Wallet(params.deserializeState?.privateKey)
      : ethers.Wallet.createRandom();
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

  /**
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<string> {
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

    const HyperBOBCollateral =
      DeterministicDeployer.getDeterministicDeployAddress(
        new HypERC20Collateral__factory(),
        0,
        [this.zkBobToken, this.hypERC20CollateralGasAmount]
      );

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
