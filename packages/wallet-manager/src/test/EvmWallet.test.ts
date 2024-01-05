import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvmWallet } from '../';

describe('EvmWallet', () => {
  describe('EvmWallet + provider on window', () => {
    beforeEach(() => {
      window.ethereum = {
        request: () => Promise.resolve(true),
        on: vi.fn()
      } as ExternalProvider & { on: () => void };
    });
    it('should be able to create an instance of EvmWallet passing a web3Provider', () => {
      const w3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const evmWallet = new EvmWallet(w3Provider);

      expect(evmWallet).toBeInstanceOf(EvmWallet);
    });

    it('should be able to create an instance of EvmWallet without passing a web3Provider', () => {
      const evmWallet = new EvmWallet();

      expect(evmWallet).toBeInstanceOf(EvmWallet);
    });
  });
});
