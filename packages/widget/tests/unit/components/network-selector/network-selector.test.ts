import { getDiffableHTML } from '@open-wc/semantic-dom-diff';
import { fixture, fixtureCleanup, oneEvent } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { afterEach, assert, describe, it, vi } from 'vitest';
import { NetworkSelector } from '../../../../src/components';

describe('network-selector component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-network-selector');
    assert.instanceOf(el, NetworkSelector);
  });
  it('renders single default option if no network supplied', async () => {
    const el = await fixture(html`
      <sygma-network-selector .networks=${[]}></sygma-network-selector>
    `);
    assert.equal(el.shadowRoot!.querySelectorAll('.network-option').length, 1);
    assert.equal(
      getDiffableHTML(el.shadowRoot!.querySelector('.selector')!),
      getDiffableHTML(
        `<select class="selector">
          <option class="network-option" value="-1">-</option>
        </select>`
      )
    );
  });
  it('triggers callback on network selected', async () => {
    const mockNetworkSelectHandler = vi.fn();
    const network = { id: 0, chainId: 1, name: 'Test', type: 'evm' };
    const el = await fixture(html`
      <sygma-network-selector
        .networks=${[network]}
        .onNetworkSelected=${mockNetworkSelectHandler}
      ></sygma-network-selector>
    `);
    const networkOptions = el.shadowRoot!.querySelectorAll('.network-option');
    assert.equal(networkOptions.length, 2);
    const listener = oneEvent(
      el.shadowRoot!.querySelector('.selector')!,
      'change',
      false
    );
    (el.shadowRoot!.querySelector('.selector') as HTMLSelectElement).value =
      '1';
    el.shadowRoot!.querySelector('.selector')!.dispatchEvent(
      new Event('change')
    );
    (networkOptions[1] as HTMLOptionElement).selected = true;
    await listener;
    assert.equal(mockNetworkSelectHandler.mock.calls.length, 1);
    assert.deepEqual(mockNetworkSelectHandler.mock.lastCall, [network]);
  });
});
