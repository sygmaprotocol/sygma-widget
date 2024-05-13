# Sygma Widget UI

The Sygma Widget is a customizable frontend that leverages the `Sygma protocol` and can be integrated into any Dapp that uses either React or Lit as a framework. More information can be found in our [docs](https://docs.buildwithsygma.com/)

This repository is divided into two packages. The [Widget](./packages/widget/) package is a Lit based webapp that allows you to have a widget for the `Sygma` protocol project as `web component`. The [React](./packages/react/) package is a wrapper around the Lit Widget that allows developers to use this application inside react projects.

## Quick setup

```bash
yarn create vite my-dapp --template react-ts
cd ./my-dapp
yarn install
yarn add @buildwithsygma/sygmaprotocol-react-widget @buildwithsygma/sygma-sdk-core
yarn dev
```

## How to integrate

Check respective readmes to follow instructions on how to integrate the Widget into your codebase. 

* for Lit based projects you can directly install, import and use the web component version of the Widget. You can find further instructions [here](./packages/widget/README.md)
* for React based projects, please refer to this [README](./packages/react/README.md) file to get further instructions
* a react example is provided [here](/examples/react-widget-app/) for a more detailed reference

### Configuration through props

You can pass props to the Widget to customize the behaviour of the Widget. You can find the complete reference of the properties avialable [here](./packages/widget/src/widget.ts). Below there is an example passing props to whitelist the source and destination network in the react component:

```ts
import { SygmaProtocolReactWidget } from "@buildwithsygma/sygmaprotocol-react-widget";

function MyDapp() {
  const [count, setCount] = useState(0);

  return (
    <SygmaProtocolReactWidget
      whitelistedSourceNetworks={["sepolia"]}
      whitelistedDestinationNetworks={["cronos"]}
    />
  );
}
```