import { fixtureCleanup } from '@open-wc/testing-helpers';
import { afterEach, assert, describe, it, vi } from 'vitest';
import { LitElement } from 'lit';
import {
  FungibleTokenTransferController,
  FungibleTransferState
} from '../../../../src/controllers/transfers/fungible-token-transfer';

describe('Amount selector component - sygma-resource-selector', () => {
  afterEach(() => {
    fixtureCleanup();
  });

  it('should return completed state even though wallet is disconnected', function () {
    const controller = new FungibleTokenTransferController(
      vi.mocked(LitElement.prototype)
    );
    controller.transferTransactionId = '0x';

    assert.equal(
      controller.getTransferState(),
      FungibleTransferState.COMPLETED
    );
  });
});
