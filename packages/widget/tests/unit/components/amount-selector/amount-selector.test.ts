import { afterEach, assert, describe, expect, it, vi } from 'vitest';
import { fixture, fixtureCleanup, nextFrame } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { ResourceType } from '@buildwithsygma/sygma-sdk-core';
import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import type { DropdownOption } from '../../../../src/components/common/dropdown/dropdown';
import { AmountSelector } from '../../../../src/components';

describe('Amount selector component - sygma-resource-selector', () => {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-resource-selector');
    assert.instanceOf(el, AmountSelector);
  });

  it('displays account balance correctly', async () => {
    const el = await fixture<AmountSelector>(
      html` <sygma-resource-selector
        accountBalance="100"
      ></sygma-resource-selector>`
    );
    await el.updateComplete;

    const balanceDisplay = el.shadowRoot!.querySelector('.balanceContent span');
    assert.strictEqual(balanceDisplay!.textContent, '100.0000');
  });

  it('calls onResourceSelected callback correctly', async () => {
    const mockOptionSelectHandler = vi.fn();
    const amount = '50';
    const resources: DropdownOption<Resource>[] = [
      {
        name: 'Resource1',
        value: {
          resourceId: 'resourceId1',
          address: 'address1',
          symbol: 'PHA',
          type: ResourceType.FUNGIBLE
        }
      }
    ];

    const el = await fixture<AmountSelector>(
      html`<sygma-resource-selector
        resources=${resources}
        accountBalance="100"
        .onResourceSelected=${mockOptionSelectHandler}
      ></sygma-resource-selector>`
    );

    // Set amount
    const input = el.shadowRoot!.querySelector(
      '.amountSelectorInput'
    ) as HTMLInputElement;
    input.value = amount;
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await el.updateComplete;

    // Set resource
    await el.updateComplete;
    el._onResourceSelectedHandler(resources[0]);

    expect(mockOptionSelectHandler).toHaveBeenCalledOnce();
    expect(mockOptionSelectHandler).toHaveBeenCalledWith(
      el.selectedResource,
      Number.parseFloat(amount)
    );
  });

  describe('Validation', () => {
    it('validates input amount when balance is low', async () => {
      const el = await fixture(
        html` <sygma-resource-selector
          accountBalance="100"
        ></sygma-resource-selector>`
      );

      // input amount greater than balance
      const input = el.shadowRoot!.querySelector(
        '.amountSelectorInput'
      ) as HTMLInputElement;
      input.value = '150';
      input.dispatchEvent(new Event('change'));
      await nextFrame();

      const validationMessage = el.shadowRoot!.querySelector(
        '.validationMessage'
      ) as HTMLDivElement;
      assert.strictEqual(
        validationMessage.textContent,
        'Amount exceeds account balance'
      );
    });

    it('validates input when amount is less than zero', async () => {
      const el = await fixture<AmountSelector>(
        html` <sygma-resource-selector
          accountBalance="100"
        ></sygma-resource-selector>`
      );

      // input amount less than zero
      const input = el.shadowRoot!.querySelector(
        '.amountSelectorInput'
      ) as HTMLInputElement;
      input.value = '-2';
      input.dispatchEvent(new Event('change'));
      await el.updateComplete;

      const validationMessage = el.shadowRoot!.querySelector(
        '.validationMessage'
      ) as HTMLDivElement;
      assert.strictEqual(
        validationMessage.textContent,
        'Amount must be greater than 0'
      );
    });

    it('validates input when account balance is zero on max button click', async () => {
      const el = await fixture<AmountSelector>(
        html` <sygma-resource-selector
          accountBalance="0"
        ></sygma-resource-selector>`
      );

      // click max button
      const maxButton = el.shadowRoot!.querySelector(
        '.maxButton'
      ) as HTMLButtonElement;

      maxButton.dispatchEvent(new Event('click'));
      await el.updateComplete;

      const validationMessage = el.shadowRoot!.querySelector(
        '.validationMessage'
      ) as HTMLDivElement;
      assert.strictEqual(validationMessage.textContent, 'Insufficient balance');
    });
  });
});
