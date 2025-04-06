import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLinkedin, FaSpinner } from 'react-icons/fa';
import '../styles/leaderboard.css'; // Ensure CSS is imported

// Reusable Leaderboard Table Component
const LeaderboardTable = ({ title, profiles, loading, error, isMain = false }) => {
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

  return (
    <div className={`leaderboard-section ${isMain ? 'main-leaderboard' : 'category-leaderboard'}`}>
      <h2 className={isMain ? 'main-title' : 'category-title'}>{title}</h2>
      {loading && (
        <div className="loading"><FaSpinner className="spinner" /> Loading...</div>
      )}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <div className="leaderboard-table-content">
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
                    {/* Optional: Add majors or other info here if needed */}
                    {/* <div className="profile-majors">{profile.education?.majors?.join(', ') || 'N/A'}</div> */}
                  </div>
                </div>
                <div className="elo">{profile.elo}</div>
              </div>
            ))
          ) : (
            <div className="leaderboard-row empty">
              <div className="no-profiles">No profiles found for this category</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Leaderboard() {
  const [overallData, setOverallData] = useState({ profiles: [], loading: true, error: null });
  const [businessData, setBusinessData] = useState({ profiles: [], loading: true, error: null });
  const [csMathData, setCsMathData] = useState({ profiles: [], loading: true, error: null });

  useEffect(() => {
    const fetchAllLeaderboards = async () => {
      // Fetch Overall Leaderboard (limit 20)
      fetchCategory(null, setOverallData, 20);
      // Fetch Business Leaderboard (limit 10)
      fetchCategory('business', setBusinessData, 10);
      // Fetch CS/Math Leaderboard (limit 10)
      fetchCategory('cs_math', setCsMathData, 10);
    };

    fetchAllLeaderboards();
  }, []);

  const fetchCategory = async (category, setData, limit) => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.getLeaderboard(limit, category); // Pass category to API call
      if (Array.isArray(data)) {
        setData({ profiles: data, loading: false, error: null });
      } else {
        console.error(`API did not return an array for category ${category}:`, data);
        setData({ profiles: [], loading: false, error: 'Invalid data format' });
      }
    } catch (err) {
      console.error(`Error fetching leaderboard for category ${category}:`, err);
      setData({ profiles: [], loading: false, error: err.message || 'Failed to load' });
    }
  };

  return (
    <div className="leaderboard-page-container">
      <Link to="/" className="nav-button back-button">
        <FaArrowLeft />
        Back to Battles
      </Link>

      <h1 className="page-title">LEADERBOARD</h1>

      <div className="leaderboards-layout">
        {/* Overall Leaderboard (Left Side) */}
        <LeaderboardTable
          title="Overall Top 20"
          profiles={overallData.profiles}
          loading={overallData.loading}
          error={overallData.error}
          isMain={true}
        />

        {/* Category Leaderboards (Right Side, Stacked) */}
        <div className="category-leaderboards-column">
          <LeaderboardTable
            title="Business Top 10"
            profiles={businessData.profiles}
            loading={businessData.loading}
            error={businessData.error}
          />
          <LeaderboardTable
            title="CS & Math Top 10"
            profiles={csMathData.profiles}
            loading={csMathData.loading}
            error={csMathData.error}
          />
        </div>
      </div>

      <div className="attribution">
        <a href="https://logo.dev" alt="Logo API">Logos provided by Logo.dev</a>
      </div>
    </div>
  );
} 