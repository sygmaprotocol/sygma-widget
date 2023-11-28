import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@builtwithsygma/sygmaprotocol-widget';
// import { Config, Domain, Environment } from '@buildwithsygma/sygma-sdk-core';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html` <div>
      <my-widget></my-widget>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
