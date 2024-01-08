import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  SdkManagerContext,
  SdkManager
} from '@buildwithsygma/sygmaprotocol-sdk-manager';
import {
  WalletManagerContext,
  WalletManagerController
} from '@buildwithsygma/sygmaprotocol-wallet-manager';
import { Domain } from '@buildwithsygma/sygma-sdk-core';

@customElement('destination-address-input')
class DestinationAddressInput extends LitElement {
  @consume({ context: SdkManagerContext, subscribe: true })
  @state()
  sdkManager?: SdkManager;

  @consume({ context: WalletManagerContext, subscribe: true })
  @state()
  walletManager?: WalletManagerController;

  @state()
  sameAddress = false;

  @state()
  error?: string;

  handleChange(e: Event) {
    const target = e.target as HTMLInputElement;

    this.sdkManager?.setDestinationAddress(target.value);
    this.requestUpdate();
  }

  handleCheckboxChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.sameAddress = target.checked;
  }

  render() {
    const destinationDomain = this.sdkManager?.assetTransfer.config
      .getDomains()
      .find(
        (domain: Domain) =>
          domain.chainId === this?.sdkManager?.destinationChainId
      );

    const sourceDomain = this.sdkManager?.assetTransfer.config
      .getDomains()
      .find(
        (domain: Domain) =>
          domain.chainId === this.sdkManager?.assetTransfer.config.chainId
      );

    if (destinationDomain?.type === sourceDomain?.type) {
      return html`<div>
        <label for="same-address">Use same address</label>
        <input
          id="same-address"
          type="checkbox"
          @change=${this.handleCheckboxChange}
          value=${this.sameAddress}
        />
        <br />
        <label for="destination-address">Destination Address</label>
        <input
          id="destination-address"
          @change=${this.handleChange}
          ?disabled=${this.sameAddress}
          value=${this.sameAddress ? this.walletManager?.accountData ?? '' : ''}
        />
      </div>`;
    } else {
      return html`<div>
        <label for="destination-address">Destination Address</label>
        <input id="destination-address" />
      </div>`;
    }
  }
}

export { DestinationAddressInput };
