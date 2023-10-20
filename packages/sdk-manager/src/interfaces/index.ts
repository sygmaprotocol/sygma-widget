import { EVMAssetTransfer } from '@buildwithsygma/sygma-sdk-core';

export type SdkManagerStatus =
  | 'idle'
  | 'initialized'
  | 'transferring'
  | 'error';

export interface ISdkManagerController {
  status: SdkManagerStatus;
  assetTransfer?: EVMAssetTransfer;
  createAssetTransfer(): void;
  initializeAssetTransfer(): Promise<void>;
}
