# React Widget

## Quick setup

To integrate this Widget into any react project follow this instructions below

### Dependencies

You will need to add this dependency to your project first:

```bash
yarn add @polkadot/extension-inject
```

### Installing the Widget

You can install the Widget by simply adding the dependency to your project:

```bash
yarn add @buildwithsygma/sygmaprotocol-react-widget @buildwithsygma/sygma-sdk-core
```

### Code integration

After installation you can simply add the Widget into your code:

```ts
import { SygmaProtocolReactWidget } from '@buildwithsygma/sygmaprotocol-react-widget';

function MyDapp(){
  return (
    <SygmaProtocolReactWidget />;
  )
}
```

You can also pass props to the Widget component to customize it:

```ts
function MyDapp(){
  return (
    <SygmaProtocolReactWidget
      environment={Environment.MAINNET}
      whitelistedSourceNetworks={["sepolia"]}
      whitelistedDestinationNetworks={["cronos"]}
      evmProvider={myEip1193Provider}
    />
  )
}
```

You can check [here](../widget/src/widget.ts) all the available properties.