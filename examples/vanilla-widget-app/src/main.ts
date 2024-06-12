import '@buildwithsygma/sygmaprotocol-widget'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <sygmaprotocol-widget 
  .environment=${'mainnet'}
  ></sygmaprotocol-widget>
`
