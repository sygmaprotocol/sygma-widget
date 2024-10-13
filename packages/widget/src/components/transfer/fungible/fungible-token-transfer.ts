import type { Domain, Resource } from '@buildwithsygma/core';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../../context/wallet';
import { choose } from 'lit/directives/choose.js';
import type { Eip1193Provider } from 'packages/widget/src/interfaces';
import type { PropertyValues } from '@lit/reactive-element';
import {
  FungibleTokenTransferController,
  FungibleTransferState
} from '../../../controllers/transfers/fungible-token-transfer';
import '../../common/buttons/button';
import '../../address-input';
import '../../resource-amount-selector';
import './transfer-button';
import './transfer-detail';
import './transfer-status';
import '../../network-selector';
import { BaseComponent } from '../../common';
import { Directions } from '../../network-selector/network-selector';
import { WalletController } from '../../../controllers';
import { styles } from './styles';
import { SelectionsController } from '../../../controllers/transfers/selections';
import { TransferStateController } from '../../../controllers/transfers/transfer-state';
import { BigNumber } from 'ethers';

@customElement('sygma-fungible-transfer')
export class FungibleTokenTransfer extends BaseComponent {
  static styles = styles;

  @property({ type: String })
  environment?: Environment = Environment.MAINNET;

  @property({ type: Object })
  whitelistedSourceNetworks?: string[];

  @property({ type: Object })
  whitelistedDestinationNetworks?: string[];

  @property({ type: Object })
  whitelistedSourceResources?: string[];

  @property({ type: Object })
  onSourceNetworkSelected?: (domain: Domain) => void;

  transferController = new FungibleTokenTransferController(this);
  transferStateController = new TransferStateController(this);
  walletController = new WalletController(this);
  selectionsController = new SelectionsController(this);

  connectedCallback(): void {
    super.connectedCallback();
    void this.transferController.init(this.environment!, {
      whitelistedSourceNetworks: this.whitelistedSourceNetworks,
      whitelistedDestinationNetworks: this.whitelistedDestinationNetworks,
      whitelistedSourceResources: this.whitelistedSourceResources
    });

    void this.selectionsController.initialize({
      environment: this.environment
    });
  }

  updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('whitelistedSourceNetworks') ||
      changedProperties.has('whitelistedDestinationNetworks') ||
      changedProperties.has('whitelistedSourceResources')
    ) {
      void this.transferController.init(this.environment!, {
        whitelistedSourceNetworks: this.whitelistedSourceNetworks,
        whitelistedDestinationNetworks: this.whitelistedDestinationNetworks,
        whitelistedSourceResources: this.whitelistedSourceResources
      });
    }
  }

  private onClick = (): void => {
    const state = this.transferStateController.getTransferState(
      this.selectionsController
    );

    switch (state) {
      case FungibleTransferState.PENDING_APPROVALS:
      case FungibleTransferState.PENDING_TRANSFER:
        {
          this.transferController.executeTransaction();
        }
        break;
      case FungibleTransferState.WALLET_NOT_CONNECTED:
        {
          this.walletController.connectWallet(
            this.selectionsController.selectedSource!
          );
        }
        break;
      case FungibleTransferState.WRONG_CHAIN:
        {
          void this.walletController.switchEvmChain(
            this.selectionsController.selectedSource!.chainId,
            this.transferController.walletContext.value?.evmWallet
              ?.provider as Eip1193Provider
          );
        }
        break;
    }

    if (state === FungibleTransferState.COMPLETED) {
      this.transferController.reset({ omitSourceNetworkReset: true });
    }
  };

  renderTransferStatus(): HTMLTemplateResult {
    return html` <section>
      <sygma-transfer-status
        .amount=${this.selectionsController.transferAmount}
        .tokenDecimals=${this.selectionsController.selectedResource?.decimals}
        .destinationNetworkName=${this.selectionsController.selectedDestination
          ?.name}
        .sourceNetworkName=${this.selectionsController.selectedSource?.name}
        .resourceSymbol=${this.selectionsController.selectedResource?.symbol}
        .explorerLinkTo=${this.transferController.getExplorerLink()}
      >
      </sygma-transfer-status>
      <sygma-fungible-transfer-button
        .state=${FungibleTransferState.COMPLETED}
        .onClick=${this.onClick}
      ></sygma-fungible-transfer-button>
    </section>`;
  }

  renderTransfer(): HTMLTemplateResult {
    return html` <form @submit=${() => {}}>
      <section class="networkSelectionWrapper">
        <sygma-network-selector
          .selectedNetwork=${this.transferController.sourceNetwork?.name}
          .direction=${Directions.FROM}
          .icons=${true}
          .onNetworkSelected=${(network?: Domain) => {
            if (network) {
              this.selectionsController.selectSource(network);
              if (this.onSourceNetworkSelected) {
                this.onSourceNetworkSelected(network);
              }
            }
          }}
          .networks=${this.selectionsController.selectableSourceDomains}
        >
        </sygma-network-selector>
      </section>
      <section class="networkSelectionWrapper">
        <sygma-network-selector
          .direction=${Directions.TO}
          .icons=${true}
          .onNetworkSelected=${(network?: Domain) => {
            if (network) {
              this.selectionsController.selectDestination(network);
            }
          }}
          .networks=${this.selectionsController.selectableDestinationDomains}
        >
        </sygma-network-selector>
      </section>
      <section>
        <sygma-resource-amount-selector
          .sourceDomainConfig=${this.selectionsController.sourceDomainConfig}
          .disabled=${!this.selectionsController.selectedSource ||
          !this.selectionsController.selectedDestination}
          .resources=${this.selectionsController.selectableResources}
          .onResourceSelected=${(resource: Resource, amount: BigNumber) => {
            this.selectionsController.selectResourceAndAmount(resource, amount);
          }}
        >
        </sygma-resource-amount-selector>
      </section>
      <section>
        <sygma-address-input
          .networkType=${this.selectionsController.selectedDestination?.type}
          .address=${this.selectionsController.recipientAddress}
          .onAddressChange=${this.selectionsController.setRecipientAddress}
        >
        </sygma-address-input>
      </section>
      <section>
        <sygma-fungible-transfer-detail
          .amountToReceive=${this.transferController.resourceAmountToDisplay}
          .estimatedGasFee=${this.transferController.estimatedGas}
          .selectedResource=${this.transferController.selectedResource}
          .fee=${this.transferController.fee}
          .sourceDomainConfig=${this.transferController.sourceDomainConfig}
        ></sygma-fungible-transfer-detail>
      </section>
      <section>
        <sygma-fungible-transfer-button
          .state=${this.transferStateController.getTransferState(
            this.selectionsController
          )}
          .onClick=${this.onClick}
        ></sygma-fungible-transfer-button>
      </section>
    </form>`;
  }

  render(): HTMLTemplateResult {
    const state = this.transferController.getTransferState();
    return choose(
      state,
      [[FungibleTransferState.COMPLETED, () => this.renderTransferStatus()]],
      () => this.renderTransfer()
    )!;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer': FungibleTokenTransfer;
  }
}
