import React, { useState, useEffect } from 'react';
import '../styles/constructionBanner.css'; // We'll create this CSS file next

const ConstructionBanner = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer = null; // Declare timer here, initially null

    const calculateTimeLeft = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(22, 0, 0, 0); // Set target to 10:00:00 PM today

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('The wait is over!');
        setIsVisible(false); // Hide the banner after 10 PM
        if (timer) clearInterval(timer); // Check if timer exists before clearing
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
    timer = setInterval(calculateTimeLeft, 1000); // Assign the interval ID to the existing timer variable

    // Cleanup interval on component unmount
    return () => {
      if (timer) clearInterval(timer); // Also check here during cleanup
    };
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