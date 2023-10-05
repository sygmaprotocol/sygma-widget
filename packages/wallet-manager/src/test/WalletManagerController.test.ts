import { LitElement } from 'lit';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers'
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { WalletManagerController } from '..';

class WidgetTestFixture extends LitElement {
  constructor() {
    super();
  }
}

customElements.define('widget-test-fixture', WidgetTestFixture);

describe('WalletManagerController', () => {
  let walletController: WalletManagerController;
  const walletTextFixture = new WidgetTestFixture();

  beforeEach(() => {
    window.ethereum = {
      request: () => Promise.resolve(true),
      on: vi.fn()
    } as ExternalProvider & { on: () => void };

    walletController = new WalletManagerController(walletTextFixture);
  });

  it('should instantiate', () => {
    expect(walletController).toBeInstanceOf(WalletManagerController);
  });
  it('should initialize evm wallet from window', () => {
    walletController.initFromWindow();
    expect(walletController.evmWallet).toBeDefined();
  });
  it('should initialize evm wallet from web3 provider', () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    walletController.initFromWeb3Provider(provider);
    expect(walletController.evmWallet).toBeDefined();
  });
});
