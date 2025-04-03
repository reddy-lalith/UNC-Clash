import React, { useState, useEffect } from 'react';
import '../styles/maintenanceScreen.css'; // We'll create this CSS file next

const MaintenanceScreen = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Calculate target time: 10 hours from now
      const targetTime = new Date(now.getTime() + 10 * 60 * 60 * 1000); 

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('Reconnecting...'); // Or refresh message
        clearInterval(timer); 
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []); 

  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <h1>SYSTEM OFFLINE</h1>
        <p className="subtitle">// Evading Intruders //</p>
        <p>Re-establishing secure connection in approximately:</p>
        <div className="countdown">{timeLeft}</div>
        <p className="footer-text">[ Remain Calm - Security Protocols Engaged ]</p>
      </div>
    </div>
  );
};

export default MaintenanceScreen; 