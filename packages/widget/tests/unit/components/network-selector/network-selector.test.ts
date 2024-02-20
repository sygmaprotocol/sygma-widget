import { fixture, fixtureCleanup, nextFrame } from '@open-wc/testing-helpers';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { afterEach, assert, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { NetworkSelector } from '../../../../src/components';
import type {
  Dropdown,
  DropdownOption
} from '../../../../src/components/common/dropdown/dropdown';

describe('network-selector component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-network-selector');
    assert.instanceOf(el, NetworkSelector);
  });

  it('generates dropdown options based on the "networks" property', async () => {
    const testNetworks = [{ name: 'Network1' }, { name: 'Network2' }];
    const el = await fixture<NetworkSelector>(
      html` <sygma-network-selector
        .networks=${testNetworks}
      ></sygma-network-selector>`
    );
    await nextFrame();

    const dropdown = el.shadowRoot?.querySelector(
      'dropdown-component'
    ) as Dropdown;

    const dropdownOptions = dropdown?.options as DropdownOption[];
    expect(dropdownOptions?.length).toBe(testNetworks.length);
  });

  it('calls "onNetworkSelected" with the correct Domain object when an option is selected', async () => {
    const testNetworks: Domain[] = [
      { id: 1, name: 'Network1', chainId: 12, type: Network.EVM },
      { id: 2, name: 'Network1', chainId: 13, type: Network.EVM }
    ];
    const onNetworkSelectedMock = vi.fn();
    const el = await fixture<NetworkSelector>(
      html` <sygma-network-selector
        .networks=${testNetworks}
        .onNetworkSelected=${onNetworkSelectedMock}
      ></sygma-network-selector>`
    );
    await nextFrame();

    el._onOptionSelected({
      name: testNetworks[0].name,
      value: testNetworks[0]
    });

    expect(onNetworkSelectedMock).toHaveBeenCalledOnce();
    expect(onNetworkSelectedMock).toHaveBeenCalledWith(testNetworks[0]);
  });
});
