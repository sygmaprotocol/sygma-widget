import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { afterEach, assert, describe, it } from 'vitest';
import type {
  Domain,
  EvmFee,
  EvmResource
} from '@buildwithsygma/sygma-sdk-core';
import {
  FeeHandlerType,
  Network,
  ResourceType
} from '@buildwithsygma/sygma-sdk-core';
import { constants } from 'ethers';
import { FungibleTransferDetail } from '../../../../src/components/transfer/fungible/transfer-detail';

describe('sygma-fungible-transfer-detail', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-fungible-transfer-detail');
    assert.instanceOf(el, FungibleTransferDetail);
  });

  it('renders transfer-detail', async () => {
    const mockedSource: Domain = {
      id: 1,
      name: 'Network1',
      chainId: 12,
      type: Network.EVM
    };

    const mockedFee: EvmFee = {
      fee: constants.Zero,
      type: FeeHandlerType.BASIC,
      handlerAddress: ''
    };

    const mockedResource: EvmResource = {
      resourceId: '',
      type: ResourceType.FUNGIBLE,
      address: ''
    };

    const el = await fixture(html`
      <sygma-fungible-transfer-detail
        .fee=${mockedFee}
        .selectedResource=${mockedResource}
        .sourceNetwork=${mockedSource}
        .config=${undefined}
      ></sygma-fungible-transfer-detail>
    `);

    const transferStatus = el.shadowRoot!.querySelector(
      '.transferDetail'
    ) as HTMLElement;

    assert.isNotNull(transferStatus);
  });
});
