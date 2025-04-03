import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ThemeProvider } from './context/ThemeContext';
// import { Analytics } from '@vercel/analytics/react';
// import { SpeedInsights } from '@vercel/speed-insights/react';
// import DarkModeToggle from './components/DarkModeToggle';
// import ConstructionBanner from './components/ConstructionBanner'; // Keep if needed later
// import Profiles from './pages/Profiles';
// import Leaderboard from './pages/Leaderboard';
// import BattleHistory from './components/BattleHistory';
import MaintenanceScreen from './components/MaintenanceScreen'; // Import the new screen
// Import base CSS if maintenance screen needs it, or import its own CSS
import './styles/maintenanceScreen.css'; // Make sure this CSS is imported

function App() {
  // Render ONLY the maintenance screen
  return <MaintenanceScreen />;
}

export default App;