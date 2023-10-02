import { ApiPromise, WsProvider } from '@polkadot/api';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SubstrateWallet } from '../wallets';

vi.mock('@polkadot/api', async () => {
  const mod =
    await vi.importActual<typeof import('@polkadot/api')>('@polkadot/api');
  const WsProviderMock = vi.fn();
  const ApiPromiseMock = {
    create: async () => {}
  };
  return {
    ...mod,
    WsProvider: WsProviderMock,
    ApiPromise: ApiPromiseMock
  };
});

describe('SubstrateWallet', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be able to create an instance of SubstrateWallet passing an ApiPromise', async () => {
    const wsProvider = new WsProvider('wss:someurl');
    const apiPromise = await ApiPromise.create({ provider: wsProvider });

    const substrateWallet = SubstrateWallet.connectFromApiPromise(apiPromise);
    expect(substrateWallet).toBeInstanceOf(SubstrateWallet);
  });

  it('should be able to create an instance of SubstrateWallet passing a wssProvider', async () => {
    const substrateWallet =
      await SubstrateWallet.connectFromWssProvider('wss:someurl');
    expect(substrateWallet).toBeInstanceOf(SubstrateWallet);
  });
});
