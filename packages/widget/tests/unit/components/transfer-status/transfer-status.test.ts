import { afterEach, assert, describe, it } from 'vitest';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { TransferStatus } from '../../../../src/components';

describe('transfer-status-component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-transfer-status');
    assert.instanceOf(el, TransferStatus);
  });

  it('renders transfer-status', async () => {
    const el = await fixture(html`
      <sygma-transfer-status
        .from=${'khala'}
        .to=${'cronos'}
        .amount=${'100'}
        .tokenSymbol=${'sygUSDC'}
        .explorerLinkTo=${'some-url'}
      ></sygma-transfer-status>
    `);

    const transferStatus = el.shadowRoot!.querySelector(
      '.transferStatusContainer'
    ) as HTMLElement;

    assert.isNotNull(transferStatus);
  });
});
