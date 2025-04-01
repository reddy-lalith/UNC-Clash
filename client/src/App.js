import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import DarkModeToggle from './components/DarkModeToggle';
import Profiles from './pages/Profiles';
import Leaderboard from './pages/Leaderboard';
import BattleHistory from './components/BattleHistory';
import './styles/app.css';
import './styles/profiles.css';
import './styles/leaderboard.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Profiles />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/battle-history" element={<BattleHistory />} />
        </Routes>
        
        {/* Custom basePath to bypass AdBlock */}
        <Analytics basePath="/monitor" />
        <SpeedInsights basePath="/monitor" />
      </Router>
    </ThemeProvider>
  );
}

export default App;