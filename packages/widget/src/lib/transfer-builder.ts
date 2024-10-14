import { Domain, Environment, Network, Resource } from '@buildwithsygma/core';
import {
  createFungibleAssetTransfer,
  FungibleTransferParams
} from '@buildwithsygma/evm';
import {
  createSubstrateFungibleAssetTransfer,
  SubstrateAssetTransferRequest
} from '@buildwithsygma/substrate';
import { BigNumber } from 'ethers';
import { Eip1193Provider } from '../interfaces';
import { ApiPromise } from '@polkadot/api';

export class TransferBuilder {
  private async buildTransfer(
    source: Network,
    params: FungibleTransferParams | SubstrateAssetTransferRequest
  ): Promise<
    | ReturnType<typeof createFungibleAssetTransfer>
    | ReturnType<typeof createSubstrateFungibleAssetTransfer>
  > {
    switch (source) {
      case Network.EVM: {
        const transfer = await createFungibleAssetTransfer(
          params as FungibleTransferParams
        );
        return transfer;
      }
      case Network.SUBSTRATE: {
        const transfer = await createSubstrateFungibleAssetTransfer(
          params as SubstrateAssetTransferRequest
        );
        return transfer;
      }
      case Network.BITCOIN:
        throw new Error();
    }
  }

  public async build(
    sourceAddress: string,
    environment: Environment,
    source: Domain,
    destination: Domain,
    resource: Resource,
    amount: BigNumber,
    recipientAddress: string,
    provider: Eip1193Provider | ApiPromise
  ): Promise<
    | ReturnType<typeof createFungibleAssetTransfer>
    | ReturnType<typeof createSubstrateFungibleAssetTransfer>
  > {
    let params: SubstrateAssetTransferRequest | FungibleTransferParams;
    if (source.type === Network.EVM) {
      params = {
        sourceAddress,
        amount: amount.toBigInt(),
        recipientAddress,
        source,
        destination,
        sourceNetworkProvider: provider as Eip1193Provider,
        resource,
        environment
      } as FungibleTransferParams;
    } else if (source.type === Network.SUBSTRATE) {
      params = {
        sourceAddress,
        sourceNetworkProvider: provider as ApiPromise,
        source,
        destination,
        resource,
        amount: amount.toBigInt(),
        destinationAddress: recipientAddress,
        environment
      } as SubstrateAssetTransferRequest;
    } else {
      throw new Error('Invalid network specified');
    }

    return await this.buildTransfer(source.type, params);
  }
}
