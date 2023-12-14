import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './styles';
import { switchNetworkIcon, sygmaLogo } from '../../assets';

@customElement('sygmaprotocol-widget')
export default class Layout extends LitElement {
  static styles = styles;

  async handleTransfer() {}

  render() {
    return html`
      <section class="widgetContainer">
        <form @submit=${this.handleTransfer}>
          <section class="switchNetwork">
            <span>${switchNetworkIcon}</span>
            <span>Switch Network</span>
          </section>
          <section>
            Network selectors space
          </section>
          <section>
            Amount
            <input type="text" />
          </section>
          <section>
            Transfer to the same address
          </section>
          <section>
            <button type='submit' class="actionButton">
              Connect
            </button>
          </section>
          <section class="poweredBy">
            <span>${sygmaLogo}</span>
            <span>Powered by Sygma</span>
          </section>
        </section>
        </form>
    `;
  }
}
