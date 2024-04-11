import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { afterEach, assert, describe, it, vi } from 'vitest';

import { html } from 'lit';
import type { ConnectWalletButton } from '../../../../src/components';
import { SubstrateAccountSelector } from '../../../../src/components';
import type { WalletContextProvider } from '../../../../src/context';
import { WalletUpdateEvent } from '../../../../src/context';
import type { Dropdown } from '../../../../src/components/common';

vi.mock('@polkadot/api');

describe('Substrate account selector component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-substrate-account-selector');
    assert.instanceOf(el, SubstrateAccountSelector);
  });

  it('displays connected substrate wallet', async () => {
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
          signerAddress: '155EekKo19tWKAPonRFywNVsVduDegYChrDVsLE8HKhXzjqe',
          signer: {}
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html`
        <sygma-substrate-account-selector></sygma-substrate-account-selector>
      `,
      { parentNode: walletContext }
    );

    const dropdown = connectComponent.shadowRoot!.querySelector<Dropdown>(
      'dropdown-component'
    ) as Dropdown;

    assert.equal(dropdown.selectedOption!.name, '155Eek...Xzjqe');

    const disconnectButton = dropdown.shadowRoot!.querySelector(
      '.substrateDisconnectButton'
    ) as HTMLButtonElement;

    assert.equal(disconnectButton.textContent!.trim(), 'Disconnect');
  });
});
