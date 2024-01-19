import type {
  EVMAssetTransfer,
  Environment,
  EvmFee,
  Fungible,
  Transfer
} from '@buildwithsygma/sygma-sdk-core';
import type { BaseProvider } from '@ethersproject/providers';
import type { UnsignedTransaction } from '@ethersproject/transactions';
import type { Signer } from 'ethers';
import type { SdkManagerStatus } from './SdkManagerStatus';

export type SdkManagerState = {
  assetTransfer: EVMAssetTransfer;
  status: SdkManagerStatus;
  transfer?: Transfer<Fungible>;
  fee?: EvmFee;
  approvalTxs?: UnsignedTransaction[];
  depositTx?: UnsignedTransaction;

  initializeSdk: (provider: BaseProvider, env?: Environment) => Promise<void>;
  initializeTransfer: (
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
