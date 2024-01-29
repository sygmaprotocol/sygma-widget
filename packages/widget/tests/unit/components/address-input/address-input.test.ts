import { afterEach, assert, describe, it, vi } from 'vitest';
import { fixture, fixtureCleanup, oneEvent } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { AddressInput } from '../../../../src/components';

describe('address-input component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-address-input');
    assert.instanceOf(el, AddressInput);
  });

  it('renders input field with address value', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .address=${'0xebFC7A970CAAbC18C8e8b7367147C18FC7585492'}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    assert.equal(input.value, '0xebFC7A970CAAbC18C8e8b7367147C18FC7585492');

    const errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage, null);
  });

  it('renders input field with incorrect address value and triggers error message', async () => {
    const mockAddressChangeHandler = vi.fn();

    let el = await fixture(html`
      <sygma-address-input
        .address=${'0x123'}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    let input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    assert.equal(input.value, '0x123');

    let errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage.textContent, 'invalid Ethereum Address');

    el = await fixture(html`
      <sygma-address-input
        .network=${Network.SUBSTRATE}
        .address=${'42sy'}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    input = el.shadowRoot!.querySelector('.inputAddress') as HTMLInputElement;

    assert.equal(input.value, '42sy');

    errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage.textContent, 'invalid Substrate address');
  });

  it('renders input field with address value and then changes triggering callback', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .address=${'0x123'}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    assert.equal(input.value, '0x123');

    const listener = oneEvent(input, 'change', false);
    input.value = '0xebFC7A970CAAbC18C8e8b7367147C18FC7585492';

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 1);
    assert.deepEqual(mockAddressChangeHandler.mock.lastCall, [
      '0xebFC7A970CAAbC18C8e8b7367147C18FC7585492'
    ]);
  });

  it('renders input field with wrong address value, cleans it and error message gets removed', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    const listener = oneEvent(input, 'change', false);
    input.value = '0xebFC7A970CAAbC18C8e8b7367147C18FC7';

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 0);

    const errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage.textContent, 'invalid Ethereum Address');

    input.value = '';

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 0);

    const errorMessageAfterClean = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessageAfterClean, null);
  });

  it('triggers callback on address change and validates Substrate address', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .network=${Network.SUBSTRATE}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
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
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
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

  it('displays error message when passing wrong substrate address', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .network=${Network.SUBSTRATE}
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    const listener = oneEvent(input, 'change', false);

    input.value = '42sydUvocBuEorweEPqxY5vZae1VaTtWoJFiKMrPbRamy'; // invalid substrate address

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 0);

    const errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage.textContent, 'invalid Substrate address');
  });

  it('displays error message when passing wrong Ethereum address', async () => {
    const mockAddressChangeHandler = vi.fn();

    const el = await fixture(html`
      <sygma-address-input
        .onAddressChange=${mockAddressChangeHandler}
      ></sygma-address-input>
    `);

    const input = el.shadowRoot!.querySelector(
      '.inputAddress'
    ) as HTMLInputElement;

    const listener = oneEvent(input, 'change', false);

    input.value = '0xebFC7A970CAAbC18C8e8b7367147C18FC7585'; // invalid eth address

    input.dispatchEvent(new Event('change'));

    await listener;

    assert.equal(mockAddressChangeHandler.mock.calls.length, 0);

    const errorMessage = el.shadowRoot!.querySelector(
      '.errorMessage'
    ) as HTMLInputElement;

    assert.equal(errorMessage.textContent, 'invalid Ethereum Address');
  });
});
