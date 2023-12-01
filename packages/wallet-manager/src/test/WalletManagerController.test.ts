import { LitElement } from 'lit';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { WalletManagerController } from '..';
import { Network } from '../types';
import { ApiPromise, WsProvider } from '@polkadot/api';

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

    walletController = new WalletManagerController(
      walletTextFixture,
      Network.EVM,
      {
        web3Provider: new ethers.providers.Web3Provider(window.ethereum)
      }
    );
  });

  it('should instantiate', () => {
    expect(walletController).toBeInstanceOf(WalletManagerController);
  });
  it('should initialize evm wallet from window', () => {
    expect(walletController.evmWallet).toBeDefined();
  });
  it('should initialize evm wallet from web3 provider', () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    walletController = new WalletManagerController(
      walletTextFixture,
      Network.EVM,
      {
        web3Provider: provider
      }
    );
    expect(walletController.evmWallet).toBeDefined();
  });
  it('should initialize substrate wallet from wss provider', () => {
    walletController = new WalletManagerController(
      walletTextFixture,
      Network.Substrate,
      {
        wssConnectionUrl: 'wss:someurl'
      }
    );
    expect(walletController.substrateWallet).toBeDefined();
  });
  it('should initialize substrate wallet from api promise', async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const apiPromise = await ApiPromise.create({ provider: wsProvider });
    walletController = new WalletManagerController(
      walletTextFixture,
      Network.Substrate,
      {
        apiPromise
      }
    );
    expect(walletController.substrateWallet).toBeDefined();
  });
});
