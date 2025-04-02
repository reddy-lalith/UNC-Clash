import React, { useState, useEffect } from 'react';
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
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(now);

      // Set target time to 10 PM (22:00:00) today
      target.setHours(22, 0, 0, 0);

      // If it's already past 10 PM today, don't count down
      if (now > target) {
        return { hours: 0, minutes: 0, seconds: 0, isTimeUp: true };
      }

      const difference = target.getTime() - now.getTime();

      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((difference / 1000 / 60) % 60);
      let seconds = Math.floor((difference / 1000) % 60);

      return { hours, minutes, seconds, isTimeUp: false };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update timer every second
    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerInterval);

  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2rem',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      {timeLeft.isTimeUp ? (
        'completely cooked'
      ) : (
        `completely cooked brb in ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
      )}
    </div>
  );
}

export default App;