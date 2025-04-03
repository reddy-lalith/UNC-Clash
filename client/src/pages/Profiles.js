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

  // Simplified effect to handle the clash transition with a fixed timer
  useEffect(() => {
    // Clear any existing timeout if conditions change before it fires
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Only trigger the transition effect if readyToEndClash is true
    if (readyToEndClash) {
      console.log("Starting transition with 1-second timer...");
      
      // Set a fixed timeout of 1 second (changed from 2 seconds)
      transitionTimeoutRef.current = setTimeout(() => {
        console.log("Transition timeout fired. Fetching next pair...");
        
        // Fetch next pair in background
        // TODO: Consider moving this fetch inside the state update timeout if flicker persists
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
          // Reset states for the new pair AFTER fade-out
          setBattleResult(null);
          setShowIdentities(false);
          setReadyToEndClash(false); // Reset the ready flag
          
          if (nextPairRef.current) {
            setSelectedPair(nextPairRef.current);
            nextPairRef.current = null;
            setCardsVisible(true); // Make cards visible immediately after setting new data
          } else {
            // Fallback if fetching next pair failed or was slow
            console.warn("Next pair not ready, re-fetching..."); // Add warning
            fetchAndSetRandomPair(); // This function handles its own loading/visibility
            return; // Exit early as fetchAndSetRandomPair manages UI
          }
          
          // REMOVED nested timeout for setting visibility
          // setTimeout(() => {
          //   setCardsVisible(true);
          // }, 50); 
        }, 300); // Wait for fade-out (match CSS transition duration)
        
      }, 1000); // Fixed 1-second delay after winner is selected
      
      // Cleanup function for the effect
      return () => {
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
      };
    }
  }, [readyToEndClash]); // Only depend on readyToEndClash

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

  const handleBattle = async (winnerId, loserId) => {
    // Avoid double-clicks or processing during transition
    if (readyToEndClash || loading) return;

    setLoading(true);

    try {
      // Immediately show identities
      setShowIdentities(true);

      // Call the backend endpoint to record the battle and get updated profiles
      const result = await api.recordBattleResult(winnerId, loserId);
      const updatedWinner = result.winner;
      const updatedLoser = result.loser;

      // Set the battle result for UI updates (without Elo change data)
      setBattleResult({
        winner: updatedWinner,
        loser: updatedLoser,
        // winnerEloChange: null, // Remove Elo change properties
        // loserEloChange: null
      });

      // Save battle to local storage (without Elo change data)
      const getCompany = (profile) => {
        if (profile.experiences && profile.experiences.length > 0) {
          return profile.experiences[0].company || 'Unknown Company';
        }
        if (profile.company) return profile.company;
        return 'Unknown Company';
      };

      const battleRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        winner: {
          id: updatedWinner._id,
          name: updatedWinner.name,
          company: getCompany(updatedWinner),
          // eloChange: null, // Remove Elo change
          profilePictureUrl: updatedWinner.profilePictureUrl || null,
          linkedinUrl: updatedWinner.linkedinUrl || null
        },
        loser: {
          id: updatedLoser._id,
          name: updatedLoser.name,
          company: getCompany(updatedLoser),
          // eloChange: null, // Remove Elo change
          profilePictureUrl: updatedLoser.profilePictureUrl || null,
          linkedinUrl: updatedLoser.linkedinUrl || null
        }
      };

      const existingBattles = JSON.parse(localStorage.getItem('battleHistory') || '[]');
      const updatedBattles = [battleRecord, ...existingBattles].slice(0, 10);
      localStorage.setItem('battleHistory', JSON.stringify(updatedBattles));
      console.log('Battle recorded and saved to history:', battleRecord);

      // Set ready flag to trigger the timer to next clash
      setReadyToEndClash(true);

    } catch (err) {
      console.error('Error handling battle:', err);
      setError(err.message || 'Failed to record battle result');
      // Optionally reset UI or show error message
      setShowIdentities(false); // Re-hide if API call failed
    } finally {
      setLoading(false); // Ensure loading state is reset
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
                eloChange={null} // Always pass null for eloChange
                isWinner={battleResult?.winner?._id === profile._id}
                isLoading={loading || initialLoading}
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