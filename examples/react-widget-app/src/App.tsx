import { SygmaProtocolReactWidget } from '@buildwithsygma/sygmaprotocol-react-widget'
import './App.css';
import sygmaIcon from './public/sygmaIcon.svg'
import gitHubIcon from './public/githubIcon.png'
import docsIcon from './public/docsIcon.png'

function App() {

  return (
    <div>
      <div className="centered">
        <SygmaProtocolReactWidget />
      </div>
      <div className="centered text-container">
        <p>If you want to obtain testnet tokens, <br/> you can do it through the Sygma faucet <a href="https://docs.buildwithsygma.com/environments/testnet/obtain-testnet-tokens" target="_blank">here</a>.</p>
      </div>
      <footer className="centered footer">
        <div className="centered icon-wrapper">
          <a href="https://buildwithsygma.com/" target="_blank"><img src={sygmaIcon} alt="Main Page" /></a>
          <a href="https://buildwithsygma.com/" target="_blank"><span>Website</span></a>
        </div>
        <div className="centered icon-wrapper">
          <a href="https://docs.buildwithsygma.com/" target="_blank"><img src={docsIcon} alt="Documentation"/></a>
          <a href="https://docs.buildwithsygma.com/" target="_blank"><span>Docs</span></a>
        </div>
        <div className="centered icon-wrapper">
          <a href="https://github.com/sygmaprotocol" target="_blank"><img src={gitHubIcon} alt="GitHub" id="github-icon"/></a>
          <a href="https://github.com/sygmaprotocol" target="_blank"><span>GitHub</span></a>
        </div>
      </footer>
  </div>
  )
}

export default App
