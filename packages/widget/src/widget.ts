import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './components';
import { style } from './style';

@customElement('sygma-protocol-widget')
export default class SygmaProcotolWidget extends LitElement {
  static style = style;
  render() {
    return html` <widget-layout></widget-layout> `;
  }
}
