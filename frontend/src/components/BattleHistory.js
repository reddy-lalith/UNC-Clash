import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaLinkedin } from 'react-icons/fa';

const BattleHistory = () => {
  const [battles, setBattles] = useState([]);
  
  useEffect(() => {
    // Load battle history from localStorage
    try {
      const savedBattles = JSON.parse(localStorage.getItem('battleHistory') || '[]');
      console.log('Loaded battles from localStorage:', savedBattles);
      
      // Debug: Log LinkedIn URLs specifically
      savedBattles.forEach((battle, index) => {
        console.log(`Battle ${index} winner LinkedIn URL:`, battle.winner.linkedinUrl);
        console.log(`Battle ${index} loser LinkedIn URL:`, battle.loser.linkedinUrl);
      });
      
      // Filter out duplicate battles
      const uniqueBattles = removeDuplicateBattles(savedBattles);
      
      setBattles(uniqueBattles);
    } catch (error) {
      console.error('Error loading battle history:', error);
      setBattles([]);
    }
  }, []);
  
  // Function to remove duplicate battles
  const removeDuplicateBattles = (battles) => {
    const seen = new Set();
    return battles.filter(battle => {
      // Create a unique key for each battle based on winner and loser IDs
      const battleKey = `${battle.winner.id}-${battle.loser.id}`;
      
      // If we've seen this battle before, filter it out
      if (seen.has(battleKey)) {
        return false;
      }
      
      // Otherwise, add it to our set and keep it
      seen.add(battleKey);
      return true;
    });
  };
  
  // Generate avatar URL based on name as fallback
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
  };
  
  // Function to open LinkedIn profile using the stored URL
  const openLinkedInProfile = (profileUrl) => {
    if (profileUrl) {
      console.log('Opening LinkedIn URL:', profileUrl);
      window.open(profileUrl, '_blank');
    } else {
      console.log('No LinkedIn URL available for this profile');
    }
  };
  
  return (
    <div className="battle-history-page">
      <div className="battle-history-header">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Battles
        </Link>
        <h1>BATTLE HISTORY</h1>
      </div>
      
      {battles.length === 0 ? (
        <div className="no-battles">
          <p>No battle history yet. Start voting to see your history!</p>
        </div>
      ) : (
        <div className="battle-list">
          {battles.map(battle => (
            <div key={battle.id} className="battle-card">
              <div className="battle-participants">
                <div className="winner">
                  <div className="participant-profile">
                    <div className="participant-avatar-container">
                      <div 
                        className="participant-avatar"
                        onClick={() => openLinkedInProfile(battle.winner.linkedinUrl)}
                      >
                        <img 
                          src={battle.winner.profilePictureUrl || getAvatarUrl(battle.winner.name)} 
                          alt={battle.winner.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getAvatarUrl(battle.winner.name);
                          }}
                        />
                        <div className="profile-overlay">
                          <FaLinkedin className="linkedin-icon" />
                        </div>
                      </div>
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{battle.winner.name}</div>
                      <div className="participant-company">{battle.winner.company}</div>
                    </div>
                  </div>
                  <div className="elo-change positive">
                    <FaArrowUp /> {battle.winner.eloChange}
                  </div>
                </div>
                
                <div className="versus">VS</div>
                
                <div className="loser">
                  <div className="participant-profile">
                    <div className="participant-avatar-container">
                      <div 
                        className="participant-avatar"
                        onClick={() => openLinkedInProfile(battle.loser.linkedinUrl)}
                      >
                        <img 
                          src={battle.loser.profilePictureUrl || getAvatarUrl(battle.loser.name)} 
                          alt={battle.loser.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getAvatarUrl(battle.loser.name);
                          }}
                        />
                        <div className="profile-overlay">
                          <FaLinkedin className="linkedin-icon" />
                        </div>
                      </div>
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{battle.loser.name}</div>
                      <div className="participant-company">{battle.loser.company}</div>
                    </div>
                  </div>
                  <div className="elo-change negative">
                    <FaArrowDown /> {Math.abs(battle.loser.eloChange)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleHistory; 