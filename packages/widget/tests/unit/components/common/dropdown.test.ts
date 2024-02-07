import { afterEach, assert, describe, it, vi } from 'vitest';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { getDiffableHTML } from '@open-wc/semantic-dom-diff';
import { Dropdown } from '../../../../src/components/common/dropdown/dropdown';

describe('Dropdown component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('dropdown-component');
    assert.instanceOf(el, Dropdown);
  });

  it('toggles dropdown on click', async () => {
    const networks = [
      { id: '1', name: 'ethereum' },
      { id: '2', name: 'khala' }
    ];

    const el = await fixture<Dropdown>(
      html` <dropdown-component .options=${networks}></dropdown-component>`
    );
    const dropdownTrigger = el.shadowRoot!.querySelector(
      '.dropdownTrigger'
    ) as HTMLDivElement;

    assert.ok(
      dropdownTrigger,
      'Dropdown trigger should be present in the component'
    );

    // Initial state should be closed
    assert.isFalse(el.isDropdownOpen);

    // Simulate click to open dropdown
    dropdownTrigger?.click();
    await el.updateComplete;
    assert.isTrue(el.isDropdownOpen);

    // Simulate another click to close dropdown
    dropdownTrigger?.click();
    await el.updateComplete;
    assert.isFalse(el.isDropdownOpen);
  });

  it('renders text when no option selected', async () => {
    const placeholderText = 'Select the network';

    const el = await fixture<Dropdown>(html`
      <dropdown-component
        .placeholder=${placeholderText}
        .options=${[]}
      ></dropdown-component>
    `);

    await el.updateComplete;

    const placeholderElement = el.shadowRoot!.querySelector(
      '.placeholder'
    ) as HTMLDivElement;

    assert.ok(
      placeholderElement,
      'default placeholder option should be present in the component'
    );

    assert.equal(
      getDiffableHTML(placeholderElement.textContent?.trim() ?? ''),
      getDiffableHTML(placeholderText)
    );
  });

  it('triggers callback on option selected', async () => {
    const mockOptionSelectHandler = vi.fn();
    const network = { id: 0, chainId: 1, name: 'Test', type: 'evm' };
    const el = await fixture<Dropdown>(html`
      <dropdown-component
        .options=${[network]}
        .onOptionSelected=${mockOptionSelectHandler}
      ></dropdown-component>
    `);

    await el.updateComplete;

    // Simulate selecting an option
    const firstOption = el.shadowRoot!.querySelector(
      '.dropdownOption'
    ) as HTMLDivElement;

    assert.ok(firstOption, 'First option should be present in the component');
    firstOption.click();
    await el.updateComplete;

    assert.equal(mockOptionSelectHandler.mock.calls.length, 1);
    assert.deepEqual(mockOptionSelectHandler.mock.lastCall, [network]);
  });
});
