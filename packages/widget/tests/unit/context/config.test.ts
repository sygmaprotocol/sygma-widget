import { ContextConsumer } from '@lit/context';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { afterEach, assert, describe, it } from 'vitest';
import { configContext, ConfigContextProvider } from '../../../src/context';

@customElement('my-element')
export class MyElement extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}

describe('config context provider', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-config-context-provider');
    assert.instanceOf(el, ConfigContextProvider);
  });

  it('handles and provides config updates', async () => {
    const contextProvider = await fixture<ConfigContextProvider>(html`
      <sygma-config-context-provider
        .appMetadata=${{ name: 'My Dapp' }}
        .whitelistedSourceNetworks=${['sepolia', 'cronos']}
        .whitelistedDestinationNetworks=${['mumbai']}
        .whitelistedSourceResources=${['ERC20LRTest']}
      ></sygma-config-context-provider>
    `);
    const child = await fixture<MyElement>(html` <my-element></my-element> `, {
      parentNode: contextProvider
    });
    const context = new ContextConsumer(child, {
      context: configContext,
      subscribe: true
    });

    assert.deepEqual(context.value, {
      theme: undefined,
      walletConnectOptions: undefined,
      appMetaData: { name: 'My Dapp' },
      whitelistedSourceNetworks: ['sepolia', 'cronos'],
      whitelistedDestinationNetworks: ['mumbai'],
      whitelistedSourceResources: ['ERC20LRTest']
    });
  });
});
