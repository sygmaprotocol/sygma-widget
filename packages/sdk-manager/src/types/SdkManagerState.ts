import {
  EVMAssetTransfer,
  Environment,
  EvmFee,
  Fungible,
  Transfer
} from '@buildwithsygma/sygma-sdk-core';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { SdkManagerStatus } from './SdkManagerStatus';
import { BaseProvider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export type SdkManagerState = {
  assetTransfer: EVMAssetTransfer;
  status: SdkManagerStatus;
  transfer?: Transfer<Fungible>;
  fee?: EvmFee;
  approvalTxs?: UnsignedTransaction[];
  depositTx?: UnsignedTransaction;

  initialize: (provider: BaseProvider, env?: Environment) => Promise<void>;
  createTransfer: (
    fromAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string
  ) => Promise<void>;

  performApprovals(signer: Signer): Promise<void>;
  performDeposit(signer: Signer): Promise<void>;
  checkSourceNetwork(provider: BaseProvider): Promise<void>;
};
