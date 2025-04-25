import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLinkedin } from 'react-icons/fa';

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard(10);
      
      // Check if data is an array, if not, handle the error
      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        console.error('API did not return an array:', data);
        setProfiles([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate fallback avatar
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
  };

  // Function to open LinkedIn profile
  const openLinkedInProfile = (e, profileUrl) => {
    if (profileUrl) {
      e.stopPropagation(); // Prevent any other potential clicks
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    } else {
      e.stopPropagation();
      console.log('No LinkedIn URL available for this profile');
    }
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <h1>LEADERBOARD</h1>
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard">
        <h1>LEADERBOARD</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h1>LEADERBOARD</h1>
      <Link to="/" className="nav-button">
        <FaArrowLeft />
        Back to Battles
      </Link>
      
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <div className="rank">Rank</div>
          <div className="profile">Profile</div>
          <div className="elo">ELO</div>
        </div>
        
        {profiles.length > 0 ? (
          profiles.map((profile, index) => (
            <div key={profile._id} className="leaderboard-row">
              <div className="rank">{index + 1}</div>
              <div className="profile">
                <div className="participant-avatar-container">
                  <div 
                    className="participant-avatar"
                    onClick={(e) => openLinkedInProfile(e, profile.linkedinUrl)}
                    style={{ cursor: profile.linkedinUrl ? 'pointer' : 'default' }}
                  >
                    <img 
                      src={profile.profilePictureUrl || getAvatarUrl(profile.name)} 
                      alt={profile.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getAvatarUrl(profile.name);
                      }}
                    />
                    {profile.linkedinUrl && (
                      <div className="profile-overlay">
                        <FaLinkedin className="linkedin-icon" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-info">
                  <div className="profile-name">{profile.name}</div>
                </div>
              </div>
              <div className="elo">{profile.elo}</div>
            </div>
          ))
        ) : (
          <div className="leaderboard-row empty">
            <div className="no-profiles">No profiles found</div>
          </div>
        )}
      </div>
      
      <div className="attribution">
        <a href="https://logo.dev" alt="Logo API">Logos provided by Logo.dev</a>
      </div>
    </div>
  );
} 