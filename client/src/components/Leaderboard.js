import React from 'react';
import { FaLinkedin, FaTrophy, FaMedal, FaAward, FaChevronLeft } from 'react-icons/fa';
import '../styles/leaderboard.css';

const Leaderboard = ({ profiles, onBack }) => {
  // Sort profiles by ELO score (highest first)
  const sortedProfiles = [...profiles].sort((a, b) => (b.elo || 0) - (a.elo || 0));
  
  // Function to get medal based on rank
  const getMedal = (rank) => {
    switch(rank) {
      case 0: return <FaTrophy className="gold-medal" />;
      case 1: return <FaMedal className="silver-medal" />;
      case 2: return <FaMedal className="bronze-medal" />;
      default: return <FaAward className="award" />;
    }
  };
  
  /// Generate avatar URL based on name as fallbacks
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
  };
  
  // Function to open LinkedIn profile
  const openLinkedInProfile = (profileUrl) => {
    if (profileUrl) {
      window.open(profileUrl, '_blank');
    }
  };
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <button className="back-button" onClick={onBack}>
          <FaChevronLeft /> Back
        </button>
        <h1>Leaderboard</h1>
      </div>
      
      <div className="leaderboard">
        {sortedProfiles.map((profile, index) => (
          <div key={profile._id} className="leaderboard-item">
            <div className="rank">
              <span className="rank-number">{index + 1}</span>
              {index < 3 && <div className="medal">{getMedal(index)}</div>}
            </div>
            
            <div className="profile-info">
              <div className="profile-avatar-container">
                <div 
                  className="profile-avatar"
                  onClick={() => openLinkedInProfile(profile.linkedinUrl)}
                >
                  <img 
                    src={profile.profilePictureUrl || getAvatarUrl(profile.name)} 
                    alt={profile.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getAvatarUrl(profile.name);
                    }}
                  />
                  <div className="profile-overlay">
                    <FaLinkedin className="linkedin-icon" />
                  </div>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-company">
                  {profile.experiences && profile.experiences.length > 0 
                    ? profile.experiences[0].company 
                    : profile.company || 'Unknown Company'}
                </div>
              </div>
            </div>
            
            <div className="elo-score">{profile.elo || 1000}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 