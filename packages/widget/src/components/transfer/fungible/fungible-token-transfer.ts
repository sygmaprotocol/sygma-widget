import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../../context/wallet';
import { choose } from 'lit/directives/choose.js';
import {
  FungibleTokenTransferController,
  FungibleTransferState
} from '../../../controllers/transfers/fungible-token-transfer';
import '../../address-input';
import '../../amount-selector';
import './transfer-button';
import './transfer-status';
import { BaseComponent } from '../../common/base-component/base-component';
import '../../network-selector';
import { Directions } from '../../network-selector/network-selector';
import { WalletController } from '../../../controllers';
import { styles } from './styles';

@customElement('sygma-fungible-transfer')
export class FungibleTokenTransfer extends BaseComponent {
  static styles = styles;

  @property({ type: Array }) whitelistedSourceResources?: Array<string>;

  @property({ type: String })
  environment?: Environment = Environment.MAINNET;

  @property({ type: Object })
  onSourceNetworkSelected?: (domain: Domain) => void;

  transferController = new FungibleTokenTransferController(this);
  walletController = new WalletController(this);

  connectedCallback(): void {
    super.connectedCallback();
    void this.transferController.init(this.environment!);
  }

  private onClick = (): void => {
    const state = this.transferController.getTransferState();
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
            this.transferController.sourceNetwork!
          );
        }
        break;
      case FungibleTransferState.WRONG_CHAIN:
        {
          this.walletController.switchChain(
            this.transferController.sourceNetwork!.chainId
          );
        }
        break;
      case FungibleTransferState.COMPLETED:
        {
          this.walletController.switchChain(
            this.transferController.sourceNetwork!.chainId
          );
        }
        break;
    }

    if (state === FungibleTransferState.COMPLETED) {
      this.transferController.reset();
    }
  };

  render(): HTMLTemplateResult {
    const state = this.transferController.getTransferState();
    return choose(
      state,
      [[FungibleTransferState.COMPLETED, () => this.renderTransferStatus()]],
      () => this.renderTransfer()
    )!;
  }

  renderTransferStatus(): HTMLTemplateResult {
    return html`<section>
      <sygma-transfer-status
        .amount=${this.transferController.resourceAmount}
        .tokenDecimals=${this.transferController.selectedResource?.decimals}
        .destinationNetworkName=${this.transferController.destinationNetwork
          ?.name}
        .sourceNetworkName=${this.transferController.sourceNetwork?.name}
        .resourceSymbol=${this.transferController.selectedResource?.symbol}
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
          .direction=${Directions.FROM}
          .icons=${true}
          .onNetworkSelected=${(network?: Domain) => {
            if (network) {
              this.onSourceNetworkSelected?.(network);
              this.transferController.onSourceNetworkSelected(network);
            }
          }}
          .networks=${this.transferController.supportedSourceNetworks}
        >
        </sygma-network-selector>
      </section>
      <section class="networkSelectionWrapper">
        <sygma-network-selector
          .direction=${Directions.TO}
          .icons=${true}
          .onNetworkSelected=${this.transferController
            .onDestinationNetworkSelected}
          .networks=${this.transferController.supportedDestinationNetworks}
        >
        </sygma-network-selector>
      </section>
      <section>
        <sygma-resource-selector
          .disabled=${!this.transferController.sourceNetwork ||
          !this.transferController.destinationNetwork}
          .resources=${this.transferController.supportedResources}
          .onResourceSelected=${this.transferController.onResourceSelected}
          accountBalance="0"
        >
        </sygma-resource-selector>
      </section>
      <section>
        <sygma-address-input
          .address=${this.transferController.destinatonAddress}
          .onAddressChange=${this.transferController.onDestinationAddressChange}
        >
        </sygma-address-input>
      </section>
      <section>
        <sygma-fungible-transfer-button
          .state=${this.transferController.getTransferState()}
          .onClick=${this.onClick}
        ></sygma-fungible-transfer-button>
      </section>
    </form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer': FungibleTokenTransfer;
  }
}
