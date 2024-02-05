import { ContextConsumer } from '@lit/context';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { ReactiveElement } from 'lit';
import { LitElement, html } from 'lit';
import { afterEach, assert, describe, it } from 'vitest';
import { customElement } from 'lit/decorators.js';
import {
  WalletContextProvider,
  WalletUpdateEvent,
  walletContext
} from '../../../src/context';
import type { EvmWallet } from '../../../src/context';

@customElement('my-element')
export class MyElement extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}

describe('wallet context provider', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-wallet-context-provider');
    assert.instanceOf(el, WalletContextProvider);
  });

  it('handles and provides wallet updates', async () => {
    const contextProvider = await fixture<WalletContextProvider>(html`
      <sygma-wallet-context-provider></sygma-wallet-context-provider>
    `);
    const child = await fixture<MyElement>(html` <my-element></my-element> `, {
      parentNode: contextProvider
    });
    const context = new ContextConsumer(child, {
      context: walletContext,
      subscribe: true
    });
    assert.deepEqual(context.value, {});

    const fakeEvmWallet: EvmWallet = {
      address: '0x1123123123123',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      provider: {} as any
    };
    contextProvider.dispatchEvent(
      new WalletUpdateEvent({ evmWallet: fakeEvmWallet })
    );

    assert.deepEqual(context.value, { evmWallet: fakeEvmWallet });
  });
});
