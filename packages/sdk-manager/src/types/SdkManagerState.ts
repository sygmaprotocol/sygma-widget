import {
  EVMAssetTransfer,
  Environment,
  EvmFee,
  Fungible,
  Transfer
} from '@buildwithsygma/sygma-sdk-core';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { SdkManagerStatus } from './SdkManagerStatus';
import { BaseProvider, Web3Provider } from '@ethersproject/providers';

export type SdkManagerState = {
  assetTransfer: EVMAssetTransfer;
  status: SdkManagerStatus;
  transfer?: Transfer<Fungible>;
  fee?: EvmFee;
  approvalTxs?: UnsignedTransaction[];
  depositTx?: UnsignedTransaction;

  initialize: (provider: BaseProvider, env?: Environment) => Promise<void>;
  createTransfer: (
    provider: BaseProvider,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string
  ) => Promise<void>;

  performApprovals(provider: Web3Provider): Promise<void>;
  performDeposit(provider: Web3Provider): Promise<void>;
};
