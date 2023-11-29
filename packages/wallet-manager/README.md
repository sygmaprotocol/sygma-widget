# SygmaProtocol Wallet Manager Package

## Install

```bash
yarn install @buildwithsygma/sygmaprotocol-wallet-manager
```

## Usage

On lit component

```bash
 # Passing a web3Provider and an apiPromise
 <wallet-manager-context
   .web3Provider=${web3Provider}
   .apiPromise=${apiPromise}>
    <your-component></your-component>
 </wallet-manager-context>

 # Passing a wssConnectionUrl
 <wallet-manager-context
  .wssConnectionUrl=${wssConnectionUrl}>
    <your-component></your-component>
  </wallet-manager-context>
```

## Develop

```bash
# Run this on the root of the monorepo
yarn install

# cd to the package
cd ./packages/wallet-manager

# start watch mode
yarn dev
```