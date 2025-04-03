import React, { useState, useEffect } from 'react';
import '../styles/constructionBanner.css'; // We'll create this CSS file next

const ConstructionBanner = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Calculate the target time: 30 minutes from when the component mounts
    const targetTime = new Date(Date.now() + 30 * 60 * 1000);
    let timer;

    const calculateTimeLeft = () => {
      const now = new Date();

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('The wait is over!');
        setIsVisible(false); // Hide the banner after 30 minutes
        clearInterval(timer); // Stop the interval
        return; // Exit if target time has passed
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
    timer = setInterval(calculateTimeLeft, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  return (
    <div className="construction-banner">
      🚧 Under Construction - Check back in: {timeLeft} 🚧
    </div>
  );
};

export default ConstructionBanner; 