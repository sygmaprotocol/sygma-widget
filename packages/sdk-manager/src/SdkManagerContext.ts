import {
  EVMAssetTransfer,
  Environment,
  EvmFee,
  Fungible,
  Transfer
} from '@buildwithsygma/sygma-sdk-core';
import { consume, createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  WalletManagerContext,
  WalletManagerController
} from '@builtwithsygma/sygmaprotocol-wallet-manager';
import {
  BaseProvider,
  Web3Provider,
  TransactionRequest
} from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { SdkManagerState, SdkManagerStatus } from './types';

export const SdkManagerContext = createContext<SdkManagerState | undefined>(
  'sdk-context'
);

export class SdkManager implements SdkManagerState {
  assetTransfer: EVMAssetTransfer;
  status: SdkManagerStatus;
  transfer?: Transfer<Fungible>;
  fee?: EvmFee;
  approvalTxs?: UnsignedTransaction[];
  depositTx?: UnsignedTransaction;

  constructor() {
    this.assetTransfer = new EVMAssetTransfer();
    this.status = 'idle';
  }

  async initialize(
    provider: BaseProvider,
    env: Environment = Environment.MAINNET
  ) {
    await this.assetTransfer.init(provider, env);
    this.status = 'initialized';
  }

  async createTransfer(
    provider: BaseProvider,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string
  ) {
    const sourceAddress = await (provider as Web3Provider)
      .getSigner()
      .getAddress();

    const transfer = await this.assetTransfer.createFungibleTransfer(
      sourceAddress,
      destinationChainId,
      destinationAddress,
      resourceId,
      amount
    );

    const fee = await this.assetTransfer.getFee(transfer);

    const approvals = await this.assetTransfer.buildApprovals(transfer, fee);

    this.transfer = transfer;
    this.fee = fee;
    this.approvalTxs = approvals;
    this.status =
      approvals.length > 0 ? 'transferCreated' : 'approvalsCompleted';

    this.depositTx = await this.assetTransfer.buildTransferTransaction(
      transfer,
      fee
    );
  }

  async performApprovals(provider: Web3Provider) {
    if (!this.transfer) {
      throw new Error('No transfer');
    }

    if (!this.approvalTxs) {
      throw new Error('No approvals');
    }

    if (!this.fee) {
      throw new Error('No fee');
    }

    const signer = provider.getSigner();
    for (const approval of this.approvalTxs) {
      await (
        await signer.sendTransaction(approval as TransactionRequest)
      ).wait();
    }

    const approvals = await this.assetTransfer.buildApprovals(
      this.transfer,
      this.fee
    );

    this.approvalTxs = approvals;
    if (!approvals || approvals.length === 0) {
      this.status = 'approvalsCompleted';
      this.depositTx = await this.assetTransfer.buildTransferTransaction(
        this.transfer,
        this.fee
      );
    }
  }

  async performDeposit(provider: Web3Provider) {
    if (!this.transfer) {
      throw new Error('No transfer');
    }

    if (!this.depositTx) {
      throw new Error('No deposit');
    }

    const signer = provider.getSigner();
    await (
      await signer.sendTransaction(this.depositTx as TransactionRequest)
    ).wait();
    this.status = 'deposited';
  }
}

/**
 * @name SdkManagerContextProvider
 * @description This component is responsible for providing the SdkManagerController as a context to all its children.
 */

@customElement('sdk-manager-context-provider')
export class SdkManagerContextProvider extends LitElement {
  @consume({ context: WalletManagerContext, subscribe: true })
  @state()
  walletManager?: WalletManagerController;

  @provide({ context: SdkManagerContext })
  @state()
  sdkManager?: SdkManager;

  constructor() {
    super();
    this.sdkManager = new SdkManager();
  }

  render() {
    return html`<slot></slot>`;
  }
}
