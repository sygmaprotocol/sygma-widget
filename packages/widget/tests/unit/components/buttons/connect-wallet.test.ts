import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import {
  elementUpdated,
  fixture,
  fixtureCleanup
} from '@open-wc/testing-helpers';
import type { EIP1193Provider } from '@web3-onboard/core';
import { html } from 'lit';
import type { MockInstance, Mocked } from 'vitest';
import { afterEach, assert, describe, it, vi } from 'vitest';
import { ConnectWalletButton } from '../../../../src/components';
import {
  WalletUpdateEvent,
  type WalletContextProvider
} from '../../../../src/context';
import { getMockedEvmWallet } from '../../../utils';

describe('connect-wallet button', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-connect-wallet-btn');
    assert.instanceOf(el, ConnectWalletButton);
  });

  it('does nothing when source network isnt selected', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);
    const el = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const connectBtn = el.shadowRoot!.querySelector(
      '.connectWalletButton'
    ) as HTMLButtonElement;

    assert.isDefined(connectBtn, 'Connect button missing');

    connectBtn.click();

    const connectBtn2 = el.shadowRoot!.querySelector(
      '.connectWalletButton'
    ) as HTMLButtonElement;

    assert.isDefined(connectBtn2, 'Connect button missing');
  });

  it('displays connected evm wallet', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    const walletProvider = getMockedEvmWallet().provider;
    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          provider: walletProvider
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isDefined(
      walletAddressEl,
      'Connected wallet address is not displayed'
    );

    assert.equal(
      walletAddressEl?.title,
      '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'
    );
    assert.equal(walletAddressEl?.textContent?.trim(), '0x9522...BAfe5');

    const disconnectButton = connectComponent.shadowRoot!.querySelector(
      '.connectWalletButton'
    ) as HTMLButtonElement;

    assert.isDefined(disconnectButton, 'Button missing');
    assert.equal(disconnectButton.textContent?.trim(), 'Disconnect');
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
          signer: {}
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isDefined(
      walletAddressEl,
      'Connected wallet address is not displayed'
    );

    assert.equal(
      walletAddressEl?.title,
      '155EekKo19tWKAPonRFywNVsVduDegYChrDVsLE8HKhXzjqe'
    );
    assert.equal(walletAddressEl?.textContent?.trim(), '155Eek...Xzjqe');

    const disconnectButton = connectComponent.shadowRoot!.querySelector(
      '.connectWalletButton'
    ) as HTMLButtonElement;

    assert.isDefined(disconnectButton, 'Button missing');
    assert.equal(disconnectButton.textContent?.trim(), 'Disconnect');
  });

  it('updates connected evm wallet', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    const walletProvider: Mocked<EIP1193Provider> = {
      //@ts-expect-error stubbed type
      on: vi.fn(),
      removeListener: vi.fn(),
      //@ts-expect-error stubbed type
      request: vi.fn()
    };
    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          provider: walletProvider
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isDefined(
      walletAddressEl,
      'Connected wallet address is not displayed'
    );

    assert.equal(
      walletAddressEl?.title,
      '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'
    );

    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: '0x758b8178A9A4B7206D1f648c4a77C515CbaC7000',
          provider: walletProvider
        }
      })
    );

    await connectComponent.updateComplete;

    assert.equal(
      walletAddressEl?.title,
      '0x758b8178A9A4B7206D1f648c4a77C515CbaC7000'
    );
  });

  it('disconnects connected evm wallet', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    const walletProvider: Mocked<EIP1193Provider> = {
      //@ts-expect-error stubbed type
      on: vi.fn(),
      removeListener: vi.fn(),
      //@ts-expect-error stubbed type
      request: vi.fn(),
      disconnect: vi.fn()
    };
    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          provider: walletProvider
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const disconnectButton =
      connectComponent.shadowRoot!.querySelector<HTMLButtonElement>(
        '.connectWalletButton'
      );

    assert.isDefined(disconnectButton, 'Button missing');
    disconnectButton?.click();
    await connectComponent.updateComplete;
    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isNull(walletAddressEl, 'Connected wallet still displayed');

    assert.equal(
      (walletProvider.disconnect as unknown as MockInstance).mock.calls.length,
      1
    );
  });

  it('disconnects connected substrate wallet', async () => {
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
    const connectComponent = await fixture<ConnectWalletButton>(
      html` <sygma-connect-wallet-btn></sygma-connect-wallet-btn> `,
      { parentNode: walletContext }
    );

    const disconnectButton =
      connectComponent.shadowRoot!.querySelector<HTMLButtonElement>(
        '.connectWalletButton'
      );

    assert.isDefined(disconnectButton, 'Button missing');
    disconnectButton?.click();
    await connectComponent.updateComplete;
    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isNull(walletAddressEl, 'Connected wallet still displayed');
  });

  it('disconnects connected evm wallet on network switch to substrate', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);

    const walletProvider: Mocked<EIP1193Provider> = {
      //@ts-expect-error stubbed type
      on: vi.fn(),
      removeListener: vi.fn(),
      //@ts-expect-error stubbed type
      request: vi.fn(),
      disconnect: vi.fn()
    };
    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          provider: walletProvider
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html`
        <sygma-connect-wallet-btn
          .sourceNetwork=${{ id: 1, type: Network.EVM }}
        ></sygma-connect-wallet-btn>
      `,
      { parentNode: walletContext }
    );

    connectComponent.sourceNetwork = {
      id: 2,
      type: Network.SUBSTRATE
    } as unknown as Domain;

    await elementUpdated(connectComponent);
    await connectComponent.updateComplete;
    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isNull(walletAddressEl, 'Connected wallet still displayed');
    assert.equal(
      (walletProvider.disconnect as unknown as MockInstance).mock.calls.length,
      1
    );
  });

  it('disconnects connected substrate wallet on network switch to ethereum', async () => {
    const walletContext = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);
    const disconnectFn = vi.fn();
    walletContext.dispatchEvent(
      new WalletUpdateEvent({
        substrateWallet: {
          accounts: [
            {
              address: '155EekKo19tWKAPonRFywNVsVduDegYChrDVsLE8HKhXzjqe'
            }
          ],
          signer: {},
          disconnect: disconnectFn
        }
      })
    );
    const connectComponent = await fixture<ConnectWalletButton>(
      html`
        <sygma-connect-wallet-btn
          .sourceNetwork=${{ id: 1, type: Network.SUBSTRATE }}
        ></sygma-connect-wallet-btn>
      `,
      { parentNode: walletContext }
    );

    connectComponent.sourceNetwork = {
      id: 2,
      type: Network.EVM
    } as unknown as Domain;

    await elementUpdated(connectComponent);
    await connectComponent.updateComplete;
    const walletAddressEl =
      connectComponent.shadowRoot!.querySelector<HTMLSpanElement>(
        '.walletAddress'
      );

    assert.isNull(walletAddressEl, 'Connected wallet still displayed');
    assert.equal(disconnectFn.mock.calls.length, 1);
  });
});
