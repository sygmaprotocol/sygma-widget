import { getDiffableHTML } from '@open-wc/semantic-dom-diff';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
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

  it('renders text when no network selected', async () => {
    const el = await fixture<NetworkSelector>(html`
      <sygma-network-selector .networks=${[]}></sygma-network-selector>
    `);

    const networkOption = el.shadowRoot!.querySelector(
      '.selectedNetwork'
    ) as HTMLDivElement;

    assert.ok(
      networkOption,
      'Network option should be present in the component'
    );

    assert.equal(
      getDiffableHTML(networkOption.textContent?.trim() ?? ''),
      getDiffableHTML('Select Network')
    );
  });

  it('toggles dropdown on click', async () => {
    const networks = [
      { id: '1', name: 'ethereum' },
      { id: '2', name: 'khala' }
    ];

    const el = await fixture<NetworkSelector>(
      html`<sygma-network-selector
        .networks=${networks}
      ></sygma-network-selector>`
    );
    const dropdownTrigger = el.shadowRoot!.querySelector(
      '.dropdownTrigger'
    ) as HTMLDivElement;

    assert.ok(
      dropdownTrigger,
      'Dropdown trigger should be present in the component'
    );

    // Initial state should be closed
    assert.isFalse(el._isDropdownOpen);

    // Simulate click to open dropdown
    dropdownTrigger?.click();
    await el.updateComplete;
    assert.isTrue(el._isDropdownOpen);

    // Simulate another click to close dropdown
    dropdownTrigger?.click();
    await el.updateComplete;
    assert.isFalse(el._isDropdownOpen);
  });

  it('triggers callback on network selected', async () => {
    const mockNetworkSelectHandler = vi.fn();
    const network = { id: 0, chainId: 1, name: 'Test', type: 'evm' };
    const el = await fixture<NetworkSelector>(html`
      <sygma-network-selector
        .networks=${[network]}
        .onNetworkSelected=${mockNetworkSelectHandler}
      ></sygma-network-selector>
    `);

    // Simulate selecting a network
    const firstOption = el.shadowRoot!.querySelector(
      '.dropdownOption'
    ) as HTMLDivElement;
    assert.ok(firstOption, 'First option should be present in the component');
    firstOption.click();
    await el.updateComplete;

    assert.equal(mockNetworkSelectHandler.mock.calls.length, 1);
    assert.deepEqual(mockNetworkSelectHandler.mock.lastCall, [network]);
  });
});
