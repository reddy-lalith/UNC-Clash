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
    
    // Only condition now is if the clash is ready to end
    if (readyToEndClash) {
      console.log("Starting transition with 1-second timer...");
      
      // Set a fixed timeout of 1 second (changed from 2 seconds)
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
            return; // Exit early as fetchAndSet handles loading state
          }
          
          // Reset states for the new pair
          setBattleResult(null);
          setShowIdentities(false);
          setReadyToEndClash(false); // Reset the ready flag
          setLoading(false); // <<< SET LOADING FALSE HERE, before fade-in
          
          // Fade-in the new cards
          setTimeout(() => {
            setCardsVisible(true);
          }, 100); // Short delay for fade-in start
        }, 300); // Wait for fade-out (match CSS transition duration)
        
      }, 1000); // Fixed 1-second delay after winner is selected (changed from 2000)
      
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
    setLoading(true); // Keep loading state
    setError(null);

    try {
      // Fetch original profiles to get pre-battle Elo
      const winner = selectedPair.find(p => p._id === winnerId);
      const loser = selectedPair.find(p => p._id === loserId);
      
      if (!winner || !loser) {
        console.error('Original winner or loser not found in selectedPair');
        setLoading(false);
        return;
      }
      const originalWinnerElo = winner.elo || 1000;

      setShowIdentities(true);

      // Replace updateProfile calls with recordBattle
      const battleData = await api.recordBattle(winnerId, loserId);
      
      // Calculate eloChange for display based on response
      const eloChange = battleData.winner.elo - originalWinnerElo;

      // Set the result locally using data from the battleData response
      setBattleResult({
        winner: battleData.winner, // Updated winner profile from backend
        loser: battleData.loser,   // Updated loser profile from backend
        eloChange: eloChange        // Calculated change for display
      });

      // --- Save battle to local storage (Keep this logic) ---
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

      const battleRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        winner: {
          id: battleData.winner._id,
          name: battleData.winner.name,
          company: getCompany(battleData.winner),
          eloChange: eloChange, // Use calculated display change
          profilePictureUrl: battleData.winner.profilePictureUrl || null,
          linkedinUrl: battleData.winner.linkedinUrl || null
        },
        loser: {
          id: battleData.loser._id,
          name: battleData.loser.name,
          company: getCompany(battleData.loser),
          eloChange: battleData.loser.elo - (loser.elo || 1000), // Calculate loser's change
          profilePictureUrl: battleData.loser.profilePictureUrl || null,
          linkedinUrl: battleData.loser.linkedinUrl || null
        }
      };
      
      // Get existing battles from localStorage
      const existingBattles = JSON.parse(localStorage.getItem('battleHistory') || '[]');
      
      // Add new battle to the beginning of the array
      const updatedBattles = [battleRecord, ...existingBattles].slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem('battleHistory', JSON.stringify(updatedBattles));
      console.log('Battle saved to history:', battleRecord);
      // --- End local storage saving --- 

      // Set ready flag to trigger the timer to next clash
      console.log("Battle processed, setting readyToEndClash = true");
      setReadyToEndClash(true);
      // setLoading(false); // Removed as endClash handles this indirectly

    } catch (err) {
      console.error('Error recording battle results:', err);
      setError(err.message || 'Failed to record battle results');
      // Ensure UI resets properly on error
      setShowIdentities(false); 
      setBattleResult(null);
      setReadyToEndClash(false);
      setLoading(false); 
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