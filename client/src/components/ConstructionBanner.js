import React, { useState, useEffect } from 'react';
import '../styles/constructionBanner.css';

const ConstructionBanner = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer = null;

    const targetTime = new Date(Date.now() + 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('Time's up!');
        setIsVisible(false);
        if (timer) clearInterval(timer);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (hours > 0) {
         setTimeLeft(
           `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
         );
      } else {
         setTimeLeft(
           `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
         );
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="construction-banner">
      Adding 60 more people in: {timeLeft}
    </div>
  );
};

export default ConstructionBanner;