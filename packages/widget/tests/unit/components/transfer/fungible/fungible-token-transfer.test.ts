import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { afterEach, assert, describe, it } from 'vitest';
import { html } from 'lit';
import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import type { AddressInput } from '../../../../../src/components';
import { FungibleTokenTransfer } from '../../../../../src/components';
import type { WalletContextProvider } from '../../../../../src/context';
import { WalletUpdateEvent } from '../../../../../src/context';
import { getMockedEvmWallet } from '../../../../utils';

describe('Fungible token Transfer', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', async () => {
    const el = await fixture(
      html` <sygma-fungible-transfer></sygma-fungible-transfer>`
    );

    assert.instanceOf(el, FungibleTokenTransfer);
  });

  it('Fill the destination address -> when networks types are the same', async () => {
    const sourceNetwork: Domain = {
      id: 2,
      chainId: 11155111,
      name: 'sepolia',
      type: Network.EVM
    };
    const destinationNetwork: Domain = {
      id: 5,
      chainId: 338,
      name: 'cronos',
      type: Network.EVM
    };
    const connectedAddress = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: connectedAddress,
          providerChainId: 1,
          provider: getMockedEvmWallet().provider
        }
      })
    );

    const fungibleTransfer = await fixture<FungibleTokenTransfer>(
      html` <sygma-fungible-transfer></sygma-fungible-transfer>`,
      { parentNode: walletContext }
    );

    // Set Source and Destination Networks
    fungibleTransfer.transferController.onSourceNetworkSelected(sourceNetwork);
    fungibleTransfer.transferController.onDestinationNetworkSelected(
      destinationNetwork
    );
    fungibleTransfer.requestUpdate();
    await fungibleTransfer.updateComplete;

    const sygmaAddressInput = fungibleTransfer.shadowRoot!.querySelector(
      'sygma-address-input'
    ) as AddressInput;

    assert(sygmaAddressInput.address === connectedAddress);
  });

  it('Should NOT fill the destination address -> when networks type is substrate', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        substrateWallet: {
          accounts: [
            {
              address: '155EekKo19tWKAPonRFywNVsVduDegYChrDVsLE8HKhXzjqe'
            }
          ],
          signer: {}
        }
      })
    );

    const fungibleTransfer = await fixture<FungibleTokenTransfer>(
      html` <sygma-fungible-transfer></sygma-fungible-transfer>`,
      { parentNode: walletContext }
    );

    const sygmaAddressInput = fungibleTransfer.shadowRoot!.querySelector(
      'sygma-address-input'
    ) as AddressInput;

    assert.equal(sygmaAddressInput.address, '');
  });
});
