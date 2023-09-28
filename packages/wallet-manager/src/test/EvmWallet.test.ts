import { ethers } from 'ethers';
import { describe, it, expect, beforeEach } from 'vitest';
import { EvmWallet } from '../';

describe('EvmWallet', () => {
  describe('EvmWallet + provider on window', () => {
    beforeEach(() => {
      window.ethereum = {
        request: () => Promise.resolve(true)
      };
    });
    it('should be able to create an instance of EvmWallet', () => {
      const w3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const evmWallet = new EvmWallet(w3Provider);

      expect(evmWallet).toBeInstanceOf(EvmWallet);
    });
  });
});
