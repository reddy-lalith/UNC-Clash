import React from 'react';
import '../styles/constructionBanner.css'; // Keep using the same CSS file for now

const ConstructionBanner = () => {
  // Remove timer state and useEffect hook
  // const [timeLeft, setTimeLeft] = useState('');
  // const [isVisible, setIsVisible] = useState(true);
  // useEffect(() => { ... timer logic ... }, []);

  // if (!isVisible) { // No longer hiding based on time
  //   return null;
  // }

  return (
    <div className="construction-banner">
       new update coming soon
    </div>
  );
};

export default ConstructionBanner; 