import { afterEach, assert, describe, it, vi } from 'vitest';
import { fixture, fixtureCleanup, oneEvent } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { AddressInput } from '../../../../src/components';

describe('address-input component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  const handleAddress = (address: string): string => address;

  it('is defined', () => {
    const el = document.createElement('sygma-address-input');
    assert.instanceOf(el, AddressInput);
  });
  it('renders input field with address value', async () => {
    const el = await fixture(html`
      <sygma-address-input
        .address=${'0x123'}
        .handleAddress=${handleAddress}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.input-address'
    ) as HTMLInputElement;

    console.log(input.value);
    assert.equal(input.value, '0x123');
  });
  it('triggers callback on address change and validates Substrate address', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .network=${'substrate'}
        .handleAddress=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.input-address'
    ) as HTMLInputElement;

    const listener = oneEvent(input, 'change', false);

    input.value = '42sydUvocBuEorweEPqxY5vZae1VaTtWoJFiKMrPbRamy2BL';

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 1);
    assert.deepEqual(mockAddressChangeHandler.mock.lastCall, [
      '42sydUvocBuEorweEPqxY5vZae1VaTtWoJFiKMrPbRamy2BL'
    ]);
  });

  it('triggers callback on address change and validates Ethereum address', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .network=${'evm'}
        .handleAddress=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.input-address'
    ) as HTMLInputElement;

    const listener = oneEvent(input, 'change', false);

    input.value = '0xebFC7A970CAAbC18C8e8b7367147C18FC7585492';

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 1);
    assert.deepEqual(mockAddressChangeHandler.mock.lastCall, [
      '0xebFC7A970CAAbC18C8e8b7367147C18FC7585492'
    ]);
  });
});
