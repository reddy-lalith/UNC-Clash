import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { FaLinkedin } from 'react-icons/fa';
import DarkModeToggle from './components/DarkModeToggle';
import Profiles from './pages/Profiles';
import Leaderboard from './pages/Leaderboard';
import BattleHistory from './components/BattleHistory';
import './styles/app.css';
import './styles/profiles.css';
import './styles/leaderboard.css';

function App() {
  const [showOptMessage, setShowOptMessage] = useState(false);
  const [showHackedMessage, setShowHackedMessage] = useState(false);

  useEffect(() => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(16, 45, 0, 0);

    if (now < targetTime) {
      setShowHackedMessage(true);
    }
    
    const timeToTarget = targetTime.getTime() - now.getTime();
    if (timeToTarget > 0) {
      const timer = setTimeout(() => {
        setShowHackedMessage(false);
      }, timeToTarget);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ThemeProvider>
      <Router>
        {showHackedMessage && (
          <div style={{
            backgroundColor: 'red',
            color: 'white',
            textAlign: 'center',
            padding: '10px',
            fontWeight: 'bold',
            position: 'sticky',
            top: 0,
            zIndex: 2000
          }}>
            i own the hackers, but please give me a min. more like 4:45 fr fr
          </div>
        )}

        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Profiles />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/battle-history" element={<BattleHistory />} />
        </Routes>
        
        <Analytics basePath="/monitor" />
        <SpeedInsights basePath="/monitor" />
        
        <div className="opt-button" onClick={() => setShowOptMessage(!showOptMessage)}>
          Opt In/Out
        </div>

        <a 
          href="https://www.linkedin.com/in/lalithreddy" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="creator-link-button"
          style={{ textDecoration: 'none' }}
        >
          <FaLinkedin style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          <span style={{ verticalAlign: 'middle' }}>Created by Lalith Reddy</span>
        </a>
        
        {showOptMessage && (
          <div className="opt-message-overlay" onClick={() => setShowOptMessage(false)}>
            <div className="opt-message" onClick={(e) => e.stopPropagation()}>
              <p>Email me at lalith@unc.edu with your unc.edu email and I will remove or add you without any questions.</p>
              <button onClick={() => setShowOptMessage(false)}>Close</button>
            </div>
          </div>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;