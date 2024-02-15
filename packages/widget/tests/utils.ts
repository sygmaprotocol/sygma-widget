import type { MockedObject } from 'vitest';
import { vi } from 'vitest';
import type { EIP1193Provider } from '@web3-onboard/core';
import type { EvmWallet } from '../src/context';

export function getMockedEvmWallet(): MockedObject<EvmWallet> {
  const mockedProvider: MockedObject<EIP1193Provider> = {
    disconnect: vi.fn(),
    //@ts-expect-error mock
    on: vi.fn(),
    //@ts-expect-error mock
    request: vi.fn(),
    removeListener: vi.fn()
  };

  return {
    address: '0x123',
    providerChainId: 1,
    provider: mockedProvider
  };
}
