import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  SdkManagerContext,
  SdkManager,
  Domain,
} from '@buildwithsygma/sygmaprotocol-sdk-manager';

@customElement('destination-address-input')
class DestinationAddressInput extends LitElement {
  @consume({ context: SdkManagerContext, subscribe: true })
  @state()
  sdkManager?: SdkManager;

  render() {
    const destinationNetwork = this.sdkManager.assetTransfer.config
      .getDomains()
      .find(
        (domain: Domain) =>
          domain.chainId === this?.sdkManager?.destinationChainId
      );

    console.log(destinationNetwork);

    return html`<div>
      <label for="same-address">Use same address</label>
      <input id="same-address" type="checkbox" />
      <br />
      <label for="destination-address">Destination Address</label>
      <input id="destination-address" />
    </div>`;
  }
}

export { DestinationAddressInput };
