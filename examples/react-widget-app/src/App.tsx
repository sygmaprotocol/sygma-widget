import { SygmaProtocolReactWidget } from '@buildwithsygma/sygmaprotocol-react-widget'
import './App.css';
import sygmaIcon from './public/sygmaIcon.svg'
import gitHubIcon from './public/githubIcon.png'
import docsIcon from './public/docsIcon.png'
import closeIcon from './public/closeIcon.png'
import { useState } from 'react';

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const obtainTokensClick = () => {
    window.open("https://docs.buildwithsygma.com/environments/testnet/obtain-testnet-tokens", "_blank");
  };

  return (

    <div className="page">
      <aside className={`sidebar centered ${sidebarOpen ? 'open' : ''}`}>
        {sidebarOpen && (
          <div id="close-icon" onClick={toggleSidebar}>
            <img src={closeIcon} alt="Close Sidebar" className="icon" />
          </div>
        )} 
        <div className="sidebar-title">Sygma Widget</div>
        <div className="icon-column"> 
          <div className="icon-wrapper">
            <a href="https://buildwithsygma.com/" target="_blank"><img src={sygmaIcon} alt="Main Page" /></a>
            <a href="https://buildwithsygma.com/" target="_blank"><span>Website</span></a>
          </div>
          <div className="icon-wrapper">
            <a href="https://docs.buildwithsygma.com/" target="_blank"><img src={docsIcon} alt="Documentation"/></a>
            <a href="https://docs.buildwithsygma.com/" target="_blank"><span>Docs</span></a>
          </div>
          <div className="icon-wrapper">
            <a href="https://github.com/sygmaprotocol" target="_blank"><img src={gitHubIcon} alt="GitHub" id="github-icon"/></a>
            <a href="https://github.com/sygmaprotocol" target="_blank"><span>GitHub</span></a>
          </div>
          <button className="sidebar-button" onClick={obtainTokensClick}>Obtain Testnet Tokens</button>
        </div>
      </aside>
      <main className={"main centered"}>
        <SygmaProtocolReactWidget />
      </main>
      {!sidebarOpen && (
        <div id="open-sidebar-button" onClick={toggleSidebar}>
          <img src={sygmaIcon} alt="Toggle Sidebar" className="icon" />
        </div>
      )}
    </div>
    )
  }
export default App
