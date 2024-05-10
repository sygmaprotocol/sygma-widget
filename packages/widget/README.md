# Sygmaprotocol Lit Widget

### Dependencies
 
To integrate the Widget to any lit project that you have, you will need to add the following dependencies:

```bash
yarn add @buildwithsygma/sygmaprotocol-widget @buildwithsygma/sygma-sdk-core
```

### Code integration

To add the Wdiget to your existing codebase just import the dependency and add the custom tag into your render method.

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@buildwithsygma/sygmaprotocol-widget'

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`
      <div>
        <sygmaprotocol-widget></sygmaprotocol-widget>
      </div>
    `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
```

You can also pass properties into the Widget to customize it's behaviour:

```ts
render() {
    return html`
      <div>
        <sygmaprotocol-widget 
        .environment=${Environment.MAINNET} 
        .whitelistedSourceNetworks=${['sepolia']} 
        .whitelistedDestinationNetworks=${['cronos']}
        ></sygmaprotocol-widget>
      </div>
    `
  }
```

You can check [here](./src/widget.ts) all the available properties.