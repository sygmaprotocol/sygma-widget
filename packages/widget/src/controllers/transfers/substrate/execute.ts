import type { FungibleTokenTransferController } from '../fungible-token-transfer';

export async function executeNextSubstrateTransaction(
  this: FungibleTokenTransferController
): Promise<void> {
  this.errorMessage = null;
  const address =
    this.walletContext.value?.substrateWallet?.accounts![0].address;
  if (!address) return;

  const unsub = (await this.transferTx?.signAndSend(
    address,
    ({ events = [], status }) => {
      if (status.isInBlock) {
        console.log(
          'Successful transfer of',
          this.resourceAmount,
          'with hash',
          status.asInBlock.toHex()
        );
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex());
      } else if (status.isDropped || status.isInvalid) {
        this.errorMessage = 'Transfer transaction reverted or rejected';
        console.log('Error: Transaction dropped');
        unsub();
      }
    }
  )) as unknown as () => void;
}
