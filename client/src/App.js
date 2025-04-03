import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import DarkModeToggle from './components/DarkModeToggle';
import ConstructionBanner from './components/ConstructionBanner';
import Profiles from './pages/Profiles';
import Leaderboard from './pages/Leaderboard';
import BattleHistory from './components/BattleHistory';
import { FaLinkedin } from 'react-icons/fa';
import './styles/app.css';
import './styles/profiles.css';
import './styles/leaderboard.css';

function App() {
  const [showOptMessage, setShowOptMessage] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <ConstructionBanner />
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Profiles />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/battle-history" element={<BattleHistory />} />
        </Routes>
        
        {/* Custom basePath to bypass AdBlock */}
        <Analytics basePath="/monitor" />
        <SpeedInsights basePath="/monitor" />
        
        {/* Opt-in/Opt-out Button */}
        <div className="opt-button" onClick={() => setShowOptMessage(!showOptMessage)}>
          Opt In/Out
        </div>
        
        {/* Opt-in/Opt-out Message Overlay */}
        {showOptMessage && (
          <div className="opt-message-overlay" onClick={() => setShowOptMessage(false)}>
            <div className="opt-message" onClick={(e) => e.stopPropagation()}>
              <p>Email me at lalith@unc.edu with your unc.edu email and I will remove or add you without any questions.</p>
              <button onClick={() => setShowOptMessage(false)}>Close</button>
            </div>
          </div>
        )}

        {/* LinkedIn Credit Button */}
        <a 
          href="https://www.linkedin.com/in/lalithreddy/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="linkedin-credit-button"
        >
          <FaLinkedin size={18} /> 
          <span>Made by Lalith Reddy</span>
        </a>
      </Router>
    </ThemeProvider>
  );
}

export default App;