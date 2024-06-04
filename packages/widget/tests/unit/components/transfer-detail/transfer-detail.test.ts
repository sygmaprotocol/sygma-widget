import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { afterEach, assert, describe, it } from 'vitest';
import type {
  BaseConfig,
  EvmFee,
  EvmResource
} from '@buildwithsygma/sygma-sdk-core';
import {
  FeeHandlerType,
  Network,
  ResourceType
} from '@buildwithsygma/sygma-sdk-core';
import type { BigNumber } from 'ethers';
import { constants } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { FungibleTransferDetail } from '../../../../src/components/transfer/fungible/transfer-detail';

describe('sygma-fungible-transfer-detail', function () {
  const mockedFee: EvmFee = {
    fee: constants.Zero,
    type: FeeHandlerType.BASIC,
    handlerAddress: ''
  };

  const mockedResource: EvmResource = {
    resourceId: '',
    type: ResourceType.FUNGIBLE,
    address: ''
  };

  const mockedSourceDomainConfig: BaseConfig<Network> = {
    id: 1,
    chainId: 1,
    name: 'ethereum',
    type: Network.EVM,
    bridge: '',
    nativeTokenSymbol: 'ETH',
    nativeTokenFullName: 'Ether',
    nativeTokenDecimals: BigInt(18),
    startBlock: BigInt(0),
    blockConfirmations: 0,
    resources: []
  };

  const mockedEstimatedGas: BigNumber = parseEther('0.0004');

  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-fungible-transfer-detail');
    assert.instanceOf(el, FungibleTransferDetail);
  });

  it('renders transfer-detail', async () => {
    const el = await fixture(html`
      <sygma-fungible-transfer-detail
        .fee=${mockedFee}
        .selectedResource=${mockedResource}
        .sourceDomainConfig=${mockedSourceDomainConfig}
        .amountToReceive=${constants.Zero}
      ></sygma-fungible-transfer-detail>
    `);

    const transferDetail = el.shadowRoot!.querySelector(
      '.transferDetail'
    ) as HTMLElement;

    assert.isNotNull(transferDetail);
  });

  it('shows sygma fee correctly', async () => {
    const value = '1.02 ETH';
    mockedFee.fee = parseUnits('1.02', 18);

    const el = await fixture(html`
      <sygma-fungible-transfer-detail
        .fee=${mockedFee}
        .selectedResource=${mockedResource}
        .sourceDomainConfig=${mockedSourceDomainConfig}
        .amountToReceive=${parseUnits('12', 18)}
      ></sygma-fungible-transfer-detail>
    `);

    const transferDetail = el.shadowRoot!.querySelector(
      '.transferDetail'
    ) as HTMLElement;

    assert.include(transferDetail.innerHTML, value);
  });

  it('shows gas fee correctly', async () => {
    const MOCKED_GAS = '0.0004 ETH';

    const el = await fixture(html`
      <sygma-fungible-transfer-detail
        .fee=${mockedFee}
        .selectedResource=${mockedResource}
        .sourceDomainConfig=${mockedSourceDomainConfig}
        .estimatedGasFee=${mockedEstimatedGas}
        .amountToReceive=${constants.Zero}
      ></sygma-fungible-transfer-detail>
    `);

    const valueElements = el.shadowRoot!.querySelector(
      '#gasFeeValue'
    ) as HTMLElement;

    assert.equal(valueElements.textContent?.trim(), MOCKED_GAS);
  });
});
