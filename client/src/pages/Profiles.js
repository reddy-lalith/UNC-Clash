import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import ConnectionCard from '../components/ConnectionCard';
import PaperPlaneBackground from '../components/PaperPlaneBackground';
import { Link } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';

export default function Profiles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [selectedPair, setSelectedPair] = useState([
    {
      _id: 'placeholder1',
      name: '',
      experiences: [],
      education: { majors: [], schools: [] }
    },
    {
      _id: 'placeholder2',
      name: '',
      experiences: [],
      education: { majors: [], schools: [] }
    }
  ]);
  const [showIdentities, setShowIdentities] = useState(false);
  const [shufflePhase, setShufflePhase] = useState(null);
  
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [cardsVisible, setCardsVisible] = useState(false);
  
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [readyToEndClash, setReadyToEndClash] = useState(false);
  
  const nextPairRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  
  // Modified: Don't disable scrolling when component mounts
  useEffect(() => {
    // No need to disable scrolling anymore - removed code that was setting
    // body styles to prevent scrolling
    
    // Not needed anymore - just return an empty cleanup function
    return () => {};
  }, []);
  
  useEffect(() => {
    if (!initialDataLoaded) {
      setCardsVisible(false);
      
      const loadInitialData = async () => {
        try {
          const data = await api.getProfiles();
          
          if (!data || data.length < 2) {
            setError('Not enough profiles for a battle');
            return;
          }
          
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          
          setSelectedPair(shuffled.slice(0, 2));
          setInitialDataLoaded(true);
          
          setTimeout(() => {
            setCardsVisible(true);
            setInitialLoading(false);
          }, 300);
        } catch (err) {
          console.error('Error fetching profiles:', err);
          setError(err.message || 'Failed to load profiles');
        }
      };
      
      loadInitialData();
    }
  }, [initialDataLoaded]);

  // NEW Effect to handle the end-of-clash transition
  useEffect(() => {
    // Clear any existing timeout if conditions change before it fires
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Conditions to transition: result processed AND cursor not hovering
    if (readyToEndClash && hoveredCardId === null) {
      console.log("Conditions met: Ready to end, not hovering. Starting transition...");
      
      // Set a timeout to allow animations/visual feedback to complete
      transitionTimeoutRef.current = setTimeout(() => {
        console.log("Transition timeout fired. Fetching next pair...");
        
        // Fetch next pair in background
        api.getProfiles().then(data => {
          if (data && data.length >= 2) {
            nextPairRef.current = [...data]
              .sort(() => 0.5 - Math.random())
              .slice(0, 2);
          }
        });
        
        // Start fade-out animation for current cards
        setCardsVisible(false);
        
        // After fade-out, update state for next pair and fade-in
        setTimeout(() => {
          if (nextPairRef.current) {
            setSelectedPair(nextPairRef.current);
            nextPairRef.current = null;
          } else {
            // Fallback if fetching next pair failed or was slow
            fetchAndSetRandomPair(); 
            return;
          }
          
          // Reset states for the new pair
          setBattleResult(null);
          setShowIdentities(false);
          setReadyToEndClash(false); // Reset the ready flag
          
          // Fade-in the new cards
          setTimeout(() => {
            setCardsVisible(true);
          }, 100); // Short delay for fade-in start
        }, 300); // Wait for fade-out (match CSS transition duration)
        
      }, 1000); // Delay after non-hover condition met (e.g., 1 second)
      
      // Cleanup function for the effect
      return () => {
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
      };
    } else {
      console.log(`Transition conditions not met: readyToEndClash=${readyToEndClash}, hoveredCardId=${hoveredCardId}`);
    }
  }, [readyToEndClash, hoveredCardId]); // Re-run when ready state or hover state changes

  const fetchAndSetRandomPair = async () => {
    try {
      setLoading(true);
      setShowIdentities(false);
      
      setCardsVisible(false);
      
      const data = await api.getProfiles();
      
      if (!data || data.length < 2) {
        setError('Not enough profiles for a battle');
        return;
      }

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      
      setTimeout(() => {
        setSelectedPair(shuffled.slice(0, 2));
        setBattleResult(null);
        
        setTimeout(() => {
          setCardsVisible(true);
          setLoading(false);
        }, 100);
      }, 300);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load profiles');
      setLoading(false);
    }
  };

  const calculateEloChange = (winnerElo, loserElo) => {
    const K = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    return Math.round(K * (1 - expectedScore));
  };

  const handleBattle = async (winnerId, loserId) => {
    try {
      const winner = selectedPair.find(p => p._id === winnerId);
      const loser = selectedPair.find(p => p._id === loserId);
      
      if (!winner || !loser) {
        console.error('Winner or loser not found');
        return;
      }

      setShowIdentities(true);

      const eloChange = calculateEloChange(winner.elo || 1000, loser.elo || 1000);
      
      // Update ELOs via API (keep this logic)
      const [updatedWinner, updatedLoser] = await Promise.all([
        api.updateProfile(winnerId, { ...winner, elo: (winner.elo || 1000) + eloChange }),
        api.updateProfile(loserId, { ...loser, elo: (loser.elo || 1000) - eloChange })
      ]);

      // Set the result locally
      setBattleResult({
        winner: updatedWinner,
        loser: updatedLoser,
        eloChange
      });

      // Save battle to local storage (keep this)
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
          id: winner._id,
          name: winner.name,
          company: getCompany(winner),
          eloChange: eloChange,
          profilePictureUrl: winner.profilePictureUrl || null,
          linkedinUrl: winner.linkedinUrl || null
        },
        loser: {
          id: loser._id,
          name: loser.name,
          company: getCompany(loser),
          eloChange: -eloChange,
          profilePictureUrl: loser.profilePictureUrl || null,
          linkedinUrl: loser.linkedinUrl || null
        }
      };
      
      // Get existing battles from localStorage
      const existingBattles = JSON.parse(localStorage.getItem('battleHistory') || '[]');
      
      // Add new battle to the beginning of the array
      const updatedBattles = [battleRecord, ...existingBattles].slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem('battleHistory', JSON.stringify(updatedBattles));
      console.log('Battle saved to history:', battleRecord);

      // ** CHANGE HERE: Instead of setTimeout for transition, set ready flag **
      console.log("Battle processed, setting readyToEndClash = true");
      setReadyToEndClash(true);

    } catch (err) {
      console.error('Error updating battle results:', err);
      setError(err.message || 'Failed to update battle results');
      // Maybe reset ready flag on error?
      setReadyToEndClash(false);
    }
  };

  // Handler for hover start on a card
  const handleCardHoverStart = (profileId) => {
    console.log("Hover Start:", profileId);
    setHoveredCardId(profileId);
  };
  
  // Handler for hover end on a card
  const handleCardHoverEnd = (profileId) => {
    console.log("Hover End:", profileId);
    // Ensure we only clear hover if the mouse is leaving the *currently* hovered card
    if (hoveredCardId === profileId) {
      setHoveredCardId(null);
    }
  };

  const handleTie = () => {
    setShowIdentities(true);
    
    setTimeout(() => {
      api.getProfiles().then(data => {
        if (data && data.length >= 2) {
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setSelectedPair(shuffled.slice(0, 2));
          setBattleResult(null);
          setShowIdentities(false);
        } else {
          fetchAndSetRandomPair();
        }
        
        setTimeout(() => {
          setCardsVisible(true);
        }, 100);
      }).catch(() => {
        fetchAndSetRandomPair();
        setCardsVisible(true);
      });
    }, 1000);
  };

  if (error) {
    return (
      <div className="connection-clash">
        <h1>CONNECTION CLASH</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <>
      <PaperPlaneBackground />
      
      {/* Navigation buttons in a vertical stack */}
      <div className="navigation-buttons">
        <Link to="/leaderboard" className="leaderboard-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Leaderboard
        </Link>
        
        <Link to="/battle-history" className="history-button">
          <FaHistory />
          Battle History
        </Link>
      </div>
      
      <div className="connection-clash">
        <h1 className="clash-title">
          CONNECTION <div className="logo-container"><img src="/clash_logo.png" alt="Clash Logo" className="clash-logo" /></div> CLASH
        </h1>
        
        <div className="battle-container">
          {selectedPair.map((profile, index) => (
            <div 
              key={profile._id || index} 
              onClick={() => !loading && !initialLoading && !showIdentities && profile._id !== 'placeholder1' && profile._id !== 'placeholder2' && handleBattle(
                profile._id, 
                selectedPair[1 - index]._id
              )}
              className={`clickable-card ${!cardsVisible ? 'hidden' : 'visible'} ${initialLoading ? 'initial-load' : ''} ${(showIdentities || loading) ? 'no-click' : ''}`}
            >
              <ConnectionCard 
                profile={profile}
                showIdentity={showIdentities} 
                eloChange={
                  battleResult?.winner?._id === profile._id ? battleResult.eloChange :
                  battleResult?.loser?._id === profile._id ? -battleResult.eloChange :
                  null
                }
                isWinner={battleResult?.winner?._id === profile._id}
                isLoading={loading || initialLoading}
                onHoverStart={handleCardHoverStart}
                onHoverEnd={handleCardHoverEnd}
              />
            </div>
          ))}
        </div>
        
        <audio id="card-shuffle" className="card-sound">
          <source src="https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3" type="audio/mpeg" />
        </audio>
        <audio id="card-deal" className="card-sound">
          <source src="https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3" type="audio/mpeg" />
        </audio>
        
        <div className="attribution">
          <a href="https://logo.dev" alt="Logo API">Logos provided by Logo.dev</a>
        </div>
        
        <div className="copyright-footer">
          © 2025 Connection Clash | Not affiliated with the University of North Carolina at Chapel Hill
        </div>
      </div>
    </>
  );
}