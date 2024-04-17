import { aTimeout, fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { afterEach, assert, describe, it, vi } from 'vitest';
import { html } from 'lit';
import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Environment, Network } from '@buildwithsygma/sygma-sdk-core';
import { FungibleTokenTransfer } from '../../../../../src/components';
import type {
  AddressInput,
  ResourceAmountSelector
} from '../../../../../src/components';
import type { WalletContextProvider } from '../../../../../src/context';
import { WalletUpdateEvent } from '../../../../../src/context';
import { getMockedEvmWallet } from '../../../../utils';

vi.mock('@polkadot/api');

const sepoliaNetwork: Domain = {
  id: 2,
  chainId: 11155111,
  name: 'sepolia',
  type: Network.EVM
};

const cronosNetwork: Domain = {
  id: 5,
  chainId: 338,
  name: 'cronos',
  type: Network.EVM
};

describe('Fungible token Transfer', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', async () => {
    const el = await fixture(
      html` <sygma-fungible-transfer
        .environment=${Environment.TESTNET}
      ></sygma-fungible-transfer>`
    );

    assert.instanceOf(el, FungibleTokenTransfer);
  });

  it('Fill the destination address -> when networks types are the same', async () => {
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
      html` <sygma-fungible-transfer
        .environment=${Environment.TESTNET}
      ></sygma-fungible-transfer>`,
      { parentNode: walletContext }
    );

    // Set Source and Destination Networks
    fungibleTransfer.transferController.onSourceNetworkSelected(sepoliaNetwork);
    fungibleTransfer.transferController.onDestinationNetworkSelected(
      cronosNetwork
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
          signer: {},
          signerAddress: '155EekK'
        }
      })
    );

    const fungibleTransfer = await fixture<FungibleTokenTransfer>(
      html` <sygma-fungible-transfer
        .environment=${Environment.TESTNET}
      ></sygma-fungible-transfer>`,
      { parentNode: walletContext }
    );

    const sygmaAddressInput = fungibleTransfer.shadowRoot!.querySelector(
      'sygma-address-input'
    ) as AddressInput;

    assert(sygmaAddressInput.address === '');
  });

  it('should filter whitelisted networks and resources', async () => {
    const whitelistedSourceNetworks = ['cronos'];
    const whitelistedDestinationNetworks = ['sepolia'];
    const whitelistedResources = ['ERC20LRTest'];
    const connectedAddress = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    const fungibleTransfer = await fixture<FungibleTokenTransfer>(
      html`<sygma-fungible-transfer
        .whitelistedSourceNetworks=${whitelistedSourceNetworks}
        .whitelistedDestinationNetworks=${whitelistedDestinationNetworks}
        .whitelistedSourceResources=${whitelistedResources}
        .environment=${Environment.TESTNET}
      ></sygma-fungible-transfer>`,
      { parentNode: walletContext }
    );

    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: connectedAddress,
          providerChainId: 11155111,
          provider: getMockedEvmWallet().provider
        }
      })
    );

    // Set Source and Destination Networks
    fungibleTransfer.transferController.onSourceNetworkSelected(cronosNetwork);
    fungibleTransfer.transferController.onDestinationNetworkSelected(
      sepoliaNetwork
    );
    fungibleTransfer.requestUpdate();
    await fungibleTransfer.updateComplete;

    const [sygmaSourceNetwork, sygmaDestinationNetwork] =
      fungibleTransfer.shadowRoot!.querySelectorAll('sygma-network-selector');

    const resourceSelector = fungibleTransfer.shadowRoot!.querySelector(
      'sygma-resource-amount-selector'
    ) as ResourceAmountSelector;

    // Wait for sdk init
    await aTimeout(1000);

    assert.isTrue(
      whitelistedSourceNetworks.includes(
        sygmaSourceNetwork.networks?.[0]?.name
      ),
      `Expected source network to be one of ${whitelistedSourceNetworks.join(', ')}, but got ${sygmaSourceNetwork.networks?.[0]?.name}`
    );
    assert.isTrue(
      whitelistedDestinationNetworks.includes(
        sygmaDestinationNetwork.networks?.[0]?.name
      ),
      `Expected destination network to be one of ${whitelistedDestinationNetworks.join(', ')}, but got ${sygmaDestinationNetwork.networks?.[0]?.name}`
    );
    assert.isTrue(
      whitelistedResources.includes(
        resourceSelector.resources[0]?.symbol || ''
      ),
      `Expected Resource to be one of ${whitelistedResources.join(', ')}, but got ${resourceSelector.resources.join(', ')}`
    );
  });
});
