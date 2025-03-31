import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedPair, setSelectedPair] = useState([]);
  const [showIdentities, setShowIdentities] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  useEffect(() => {
    fetchAndSetRandomPair();
  }, []);

  const fetchAndSetRandomPair = async () => {
    try {
      setLoading(true);
      setShowIdentities(false);
      const { data } = await axios.get('/api/profiles');
      
      if (!data || data.length < 2) {
        setError('Not enough profiles for a battle');
        return;
      }

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setSelectedPair(shuffled.slice(0, 2));
      setBattleResult(null);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
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
      
      if (!winner || !loser) return;

      setShowIdentities(true);

      const eloChange = calculateEloChange(winner.elo || 1000, loser.elo || 1000);
      
      const [updatedWinner, updatedLoser] = await Promise.all([
        axios.put(`/api/profiles/${winnerId}`, {
          ...winner,
          elo: (winner.elo || 1000) + eloChange
        }),
        axios.put(`/api/profiles/${loserId}`, {
          ...loser,
          elo: (loser.elo || 1000) - eloChange
        })
      ]);

      setBattleResult({
        winner: updatedWinner.data,
        loser: updatedLoser.data,
        eloChange
      });

      setTimeout(fetchAndSetRandomPair, 2000);
    } catch (err) {
      console.error('Error updating battle results:', err);
      setError(err.message || 'Failed to update battle results');
    }
  };

  const handleTie = () => {
    setShowIdentities(true);
    setTimeout(fetchAndSetRandomPair, 3000);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Connection Clash</title>
        </Head>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Finding worthy opponents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Connection Clash - Error</title>
        </Head>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Connection Clash</title>
      </Head>
      
      <header className={styles.header}>
        <h1>CONNECTION CLASH</h1>
        <Link href="/leaderboard" className={styles.navLink}>
          Leaderboard
        </Link>
      </header>

      <main className={styles.battleContainer}>
        {selectedPair.map((profile, index) => (
          <div 
            key={profile._id} 
            onClick={() => handleBattle(profile._id, selectedPair[1 - index]._id)}
            className={styles.profileCard}
          >
            <div className={styles.profileHeader}>
              <div className={`${styles.profileImage} ${!showIdentities ? styles.blurred : ''}`}>
                {profile.profilePictureUrl ? (
                  <img 
                    src={profile.profilePictureUrl} 
                    alt={profile.name}
                  />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
              </div>
              <div className={styles.profileInfo}>
                <h2 className={!showIdentities ? styles.blurred : ''}>{profile.name}</h2>
                {showIdentities && battleResult && (
                  <div className={styles.eloChange}>
                    {battleResult.winner?._id === profile._id && (
                      <span className={styles.positive}>+{battleResult.eloChange}</span>
                    )}
                    {battleResult.loser?._id === profile._id && (
                      <span className={styles.negative}>-{battleResult.eloChange}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.experiences}>
              {profile.experiences.map((exp, i) => (
                <div key={i} className={styles.experienceItem}>
                  <div className={styles.companyLogo}>
                    <img 
                      src={exp.companyLogo}
                      alt={exp.company}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${exp.company}&background=random`;
                      }}
                    />
                  </div>
                  <div className={styles.experienceDetails}>
                    <h3>{exp.company}</h3>
                    <p>{exp.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className={styles.versus} onClick={handleTie}>
          <span>TIE</span>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <p>Logos provided by <a href="https://logo.dev">Logo.dev</a></p>
      </footer>
    </div>
  );
} 