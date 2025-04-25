import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ConnectionCard from './ConnectionCard';
import { FaRandom, FaHistory, FaArrowLeft, FaLinkedin } from 'react-icons/fa';
import { fetchRandomProfiles, updateElo } from '../services/api';

const ConnectionClash = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);
  const [eloChanges, setEloChanges] = useState({ winner: 0, loser: 0 });
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  
  // Add a ref to track the last click time
  const lastClickTimeRef = useRef(0);
  // Add a ref to track if a vote is in progress
  const voteInProgressRef = useRef(false);

  // Load profiles on mount
  useEffect(() => {
    loadRandomProfiles();
    
    // Clean up any timers on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Try using direct DOM event listeners instead of React's synthetic events
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseEnter = () => {
      console.log('DOM: Container mouse enter');
      setIsContainerHovered(true);
    };
    
    const handleMouseLeave = () => {
      console.log('DOM: Container mouse leave');
      setIsContainerHovered(false);
    };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef.current]);

  // Navigation effect
  useEffect(() => {
    console.log('Navigation effect running. Winner:', !!winner, 'isHovered:', isContainerHovered);
    
    if (winner && !isContainerHovered) {
      if (timeoutRef.current) {
        console.log('Clearing existing timeout');
        clearTimeout(timeoutRef.current);
      }
      
      console.log('Setting new timeout for 10 seconds');
      timeoutRef.current = setTimeout(() => {
        console.log('Timeout fired, navigating...');
        navigate('/');
      }, 10000); // Increased to 10 seconds
      
      // Add this to track when the timeout should fire
      const expectedTime = new Date(Date.now() + 10000);
      console.log('Expected navigation time:', expectedTime.toLocaleTimeString());
    } else {
      if (timeoutRef.current) {
        console.log('Clearing timeout because conditions changed');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    // Add a cleanup function that logs when it runs
    return () => {
      if (timeoutRef.current) {
        console.log('Effect cleanup: clearing timeout');
        clearTimeout(timeoutRef.current);
      }
    };
  }, [winner, isContainerHovered, navigate]);

  // Add a countdown timer effect
  useEffect(() => {
    if (winner && !isContainerHovered) {
      setTimeRemaining(10); // Start at 10 seconds
      
      const intervalId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(intervalId);
    } else {
      setTimeRemaining(null);
    }
  }, [winner, isContainerHovered]);

  // Add this useEffect to log when winner changes
  useEffect(() => {
    console.log('Winner state changed:', winner);
    if (winner) {
      console.log('Winner LinkedIn URL:', winner.linkedinUrl);
    }
  }, [winner]);

  const loadRandomProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      setWinner(null);
      setLoser(null);
      const data = await fetchRandomProfiles();
      setProfiles(data);
    } catch (err) {
      setError('Failed to load profiles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      // Reset vote in progress flag when new profiles are loaded
      voteInProgressRef.current = false;
    }
  };

  const handleVote = async (winnerId) => {
    // If a vote has already been registered or we're loading, ignore the click
    if (winner || loading || voteInProgressRef.current) {
      console.log('Vote already in progress or loading, ignoring click');
      return;
    }

    // Immediately set vote in progress flag to prevent any further clicks
    voteInProgressRef.current = true;
    // Set loading state to show visual feedback
    setLoading(true);

    try {
      const winnerProfile = profiles.find(p => p._id === winnerId);
      const loserProfile = profiles.find(p => p._id !== winnerId);
      
      console.log('Winner profile:', winnerProfile);
      console.log('Loser profile:', loserProfile);
      
      setWinner(winnerProfile);
      setLoser(loserProfile);
      
      const result = await updateElo(winnerProfile._id, loserProfile._id);
      setEloChanges({
        winner: result.winnerEloChange,
        loser: result.loserEloChange
      });
      
      // Get current company from experiences if available
      const getCompany = (profile) => {
        // Always prioritize the first experience's company
        if (profile.experiences && profile.experiences.length > 0) {
          return profile.experiences[0].company || 'Unknown Company';
        }
        // Fall back to the profile company field if no experiences
        if (profile.company) return profile.company;
        return 'Unknown Company';
      };
      
      // Save battle to local storage
      const battleRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        winner: {
          id: winnerProfile._id,
          name: winnerProfile.name,
          company: getCompany(winnerProfile),
          eloChange: result.winnerEloChange,
          profilePictureUrl: winnerProfile.profilePictureUrl || null,
          linkedinUrl: winnerProfile.linkedinUrl || null
        },
        loser: {
          id: loserProfile._id,
          name: loserProfile.name,
          company: getCompany(loserProfile),
          eloChange: result.loserEloChange,
          profilePictureUrl: loserProfile.profilePictureUrl || null,
          linkedinUrl: loserProfile.linkedinUrl || null
        }
      };
      
      console.log('Saving battle record:', battleRecord);
      
      // Get existing battles from localStorage
      const existingBattles = JSON.parse(localStorage.getItem('battleHistory') || '[]');
      
      // Check if this battle is a duplicate of the most recent one
      const isDuplicate = existingBattles.length > 0 && 
        existingBattles[0].winner.id === battleRecord.winner.id && 
        existingBattles[0].loser.id === battleRecord.loser.id;
      
      if (!isDuplicate) {
        // Only add the battle if it's not a duplicate
        const updatedBattles = [battleRecord, ...existingBattles].slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('battleHistory', JSON.stringify(updatedBattles));
        console.log('Updated battle history in localStorage');
      } else {
        console.log('Duplicate battle detected, not adding to history');
      }
      
      // Add a delay before loading new profiles
      setTimeout(() => {
        // Reset winner and loser before loading new profiles
        setWinner(null);
        setLoser(null);
        loadRandomProfiles();
      }, 2000); // 2 second delay
      
    } catch (err) {
      console.error('Error updating ELO:', err);
      setLoading(false);
      // Reset vote in progress flag on error
      voteInProgressRef.current = false;
    }
  };

  const handleSkip = () => {
    loadRandomProfiles();
  };

  // Function to open LinkedIn profile
  const openLinkedInProfile = (profileUrl) => {
    if (profileUrl) {
      console.log('Opening LinkedIn URL:', profileUrl);
      window.open(profileUrl, '_blank');
    } else {
      console.log('No LinkedIn URL available for this profile');
    }
  };

  // Also log in the render function
  console.log('Rendering ConnectionClash, winner:', winner);

  if (loading) {
    return <div className="loading">Loading profiles...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (profiles.length < 2) {
    return <div className="error-message">Not enough profiles available for a clash.</div>;
  }

  return (
    <div className="connection-clash">
      <div className="nav-bar">
        <Link to="/" className="nav-button">
          <FaArrowLeft /> Home
        </Link>
        <h1>Connection Clash</h1>
        <Link to="/battle-history" className="nav-button">
          <FaHistory /> Battle History
        </Link>
      </div>
      
      <div
        ref={containerRef}
        className="battle-container"
        onMouseEnter={() => setIsContainerHovered(true)}
        onMouseLeave={() => setIsContainerHovered(false)}
      >
        {profiles.slice(0, 2).map((profile, index) => (
          <div 
            key={profile._id} 
            className={`profile-card ${winner ? 'voted' : ''}`}
          >
            <div 
              className="card-content"
              onClick={() => !winner && !loading && handleVote(profile._id)}
            >
              <div className="profile-header">
                <div className={`profile-image ${!winner ? 'blurred' : ''}`}>
                  <img 
                    src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`} 
                    alt={profile.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`;
                    }}
                  />
                </div>
                <div className="profile-info">
                  <h2 className={!winner ? 'blurred' : ''}>
                    {profile.name}
                  </h2>
                  {winner && (
                    <div className="profile-company">
                      {profile.experiences && profile.experiences.length > 0 
                        ? profile.experiences[0].company 
                        : profile.company || 'Unknown Company'}
                    </div>
                  )}
                  {winner && profile._id === winner._id && (
                    <div className="elo-change positive">
                      +{eloChanges.winner}
                    </div>
                  )}
                  {winner && profile._id !== winner._id && (
                    <div className="elo-change negative">
                      -{Math.abs(eloChanges.loser)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* LinkedIn button - Make it more visible and ensure it appears */}
            {winner && (
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '15px',
                  marginBottom: '15px',
                  padding: '0 10px'
                }}
              >
                <button
                  onClick={() => openLinkedInProfile(profile.linkedinUrl)}
                  style={{
                    backgroundColor: '#0077b5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <FaLinkedin /> Connect on LinkedIn
                </button>
              </div>
            )}
          </div>
        ))}
        
        <div
          className={`versus-circle ${!winner ? 'clickable' : ''}`}
          onClick={!winner ? handleSkip : undefined}
        >
          {!winner ? <FaRandom /> : 'VS'}
        </div>
      </div>
    </div>
  );
};

export default ConnectionClash; 
