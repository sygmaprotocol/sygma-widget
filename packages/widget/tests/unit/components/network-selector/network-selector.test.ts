import { fixture, fixtureCleanup, nextFrame } from '@open-wc/testing-helpers';
import { afterEach, assert, describe, it, expect, vi } from 'vitest';
import { html } from 'lit';
import { NetworkSelector } from '../../../../src/components';
import type { Dropdown } from '../../../../src/components/common/dropdown/dropdown';

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
      html`<sygma-network-selector
        .networks=${testNetworks}
      ></sygma-network-selector>`
    );
    await nextFrame();

    const dropdown = el.shadowRoot?.querySelector(
      'dropdown-component'
    ) as Dropdown;
    expect(dropdown?.options.length).toBe(testNetworks.length);
  });

  it('calls "onNetworkSelected" with the correct Domain object when an option is selected', async () => {
    const testNetworks = [{ name: 'Network1' }, { name: 'Network2' }];
    const onNetworkSelectedMock = vi.fn();
    const el = await fixture<NetworkSelector>(
      html`<sygma-network-selector
        .networks=${testNetworks}
        .onNetworkSelected=${onNetworkSelectedMock}
      ></sygma-network-selector>`
    );
    await nextFrame();

    el._onOptionSelected({ name: 'Network1' });

    expect(onNetworkSelectedMock).toHaveBeenCalledOnce();
    expect(onNetworkSelectedMock).toHaveBeenCalledWith(testNetworks[0]);
  });
});
