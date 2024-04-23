import { useState } from 'react';
import { SygmaProtocolReactWidget } from '@buildwithsygma/sygmaprotocol-react-widget';

import closeIcon from './public/closeIcon.png';
import docsIcon from './public/docsIcon.png';
import gitHubIcon from './public/githubIcon.png';
import sidebarIcon from './public/sidebarIcon.png';
import sygmaIcon from './public/sygmaIcon.svg';

import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const obtainTokensClick = () => {
    window.open(
      'https://docs.buildwithsygma.com/environments/testnet/obtain-testnet-tokens',
      '_blank',
    );
  };

  return (
    <div className="page">
      <aside className={`sidebar centered ${sidebarOpen ? 'open' : ''}`}>
        {sidebarOpen && (
          <button type="button" id="close-icon" onClick={toggleSidebar}>
            <img src={closeIcon} alt="Close Sidebar" className="icon" />
          </button>
        )}
        <div className="sidebar-title">Sygma Widget</div>
        <div className="icon-column">
          <div className="icon-wrapper">
            <a href="https://buildwithsygma.com/" target="_blank" rel="noreferrer">
              <img src={sygmaIcon} alt="Main Page" />
            </a>
            <a href="https://buildwithsygma.com/" target="_blank" rel="noreferrer">
              <span>Website</span>
            </a>
          </div>
          <div className="icon-wrapper">
            <a href="https://docs.buildwithsygma.com/" target="_blank" rel="noreferrer">
              <img src={docsIcon} alt="Documentation" />
            </a>
            <a href="https://docs.buildwithsygma.com/" target="_blank" rel="noreferrer">
              <span>Docs</span>
            </a>
          </div>
          <div className="icon-wrapper">
            <a href="https://github.com/sygmaprotocol" target="_blank" rel="noreferrer">
              <img src={gitHubIcon} alt="GitHub" id="github-icon" />
            </a>
            <a href="https://github.com/sygmaprotocol" target="_blank" rel="noreferrer">
              <span>GitHub</span>
            </a>
          </div>
          <button type="button" className="sidebar-button" onClick={obtainTokensClick}>
            Obtain Testnet Tokens
          </button>
        </div>
      </aside>
      <main className="main centered">
        <SygmaProtocolReactWidget />
      </main>
      {!sidebarOpen && (
        <button type="button" id="open-sidebar-button" onClick={toggleSidebar}>
          <img src={sidebarIcon} alt="Toggle Sidebar" className="icon" />
        </button>
      )}
    </div>
  );
}

export default App;
