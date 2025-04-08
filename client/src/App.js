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
  // const [showOptMessage, setShowOptMessage] = useState(false); // No longer needed

  // Return null or a minimal div to render nothing visible
  return <div className="black-screen-placeholder"></div>; 
}

export default App;