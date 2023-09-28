import { ExternalProvider } from '@ethersproject/providers';
import { describe, it, expect, beforeEach } from 'vitest';
import { EvmWallet } from '../';

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

describe('EvmWallet', () => {
  describe('EvmWallet + provider on window', () => {
    beforeEach(() => {
      window.ethereum = {
        request: () => Promise.resolve(true)
      };
    });
    it('should be able to create an instance of EvmWallet', () => {
      const evmWallet = new EvmWallet('metamask', 'icon', window.ethereum);

      expect(evmWallet).toBeInstanceOf(EvmWallet);
      expect(evmWallet.name).toBe('metamask');
    });
  });
});
