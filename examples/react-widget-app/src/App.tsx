import { SygmaProtocolReactWidget } from '@buildwithsygma/sygmaprotocol-react-widget'
import './App.css';
import sygmaLogo from './public/favicon.svg'
import gitHubLogo from './public/git.png'

function App() {

  return (
    <div>
      <div className="centered">
        <SygmaProtocolReactWidget />
      </div>
      <div className="centered text-container">
        <p>If you want to obtain testnet tokens, you can <br/> &nbsp; &nbsp; &nbsp; &nbsp; do it through the Sygma faucet <a href="https://docs.buildwithsygma.com/environments/testnet/obtain-testnet-tokens" target="_blank">here</a>.</p>
      </div>
      <footer className="centered footer">
        <a href="https://buildwithsygma.com/" target="_blank"><img src={sygmaLogo} alt="Main Page" style={{ marginLeft: "20%" }}/>Website</a>
        <a href="https://docs.buildwithsygma.com/" target="_blank"><img src={sygmaLogo} alt="Documentation" style={{ marginLeft: "10%" }} />Docs</a>
        <a href="https://github.com/sygmaprotocol" target="_blank"><img src={gitHubLogo} alt="GitHub" style={{ width: "50px" }} />GitHub</a>
      </footer>
  </div>

  )
}

export default App
