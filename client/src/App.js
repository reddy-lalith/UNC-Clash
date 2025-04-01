import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import DarkModeToggle from './components/DarkModeToggle';
import Profiles from './pages/Profiles';
import Leaderboard from './pages/Leaderboard';
import BattleHistory from './components/BattleHistory';
import './styles/app.css';
import './styles/profiles.css';
import './styles/leaderboard.css';

function App() {
  useEffect(() => {
    // Initialize Vercel Analytics with a custom endpoint to bypass AdBlock
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

    // Create and inject analytics script tag
    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = '/aura-stats/script.js';
    analyticsScript.setAttribute('data-endpoint', '/aura-stats');
    document.head.appendChild(analyticsScript);

    // Create and inject speed insights script tag
    const speedScript = document.createElement('script');
    speedScript.async = true;
    speedScript.src = '/aura-speed/script.js';
    speedScript.setAttribute('data-endpoint', '/aura-speed');
    document.head.appendChild(speedScript);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Profiles />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/battle-history" element={<BattleHistory />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;