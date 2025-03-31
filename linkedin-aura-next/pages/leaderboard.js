import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/Leaderboard.module.css';

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
      const { data } = await axios.get('/api/profiles/leaderboard?limit=10');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Connection Clash - Leaderboard</title>
      </Head>
      
      <header className={styles.header}>
        <h1>LEADERBOARD</h1>
        <Link href="/" className={styles.navLink}>
          Back to Battles
        </Link>
      </header>

      <main className={styles.leaderboardContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.leaderboardTable}>
            <div className={styles.tableHeader}>
              <div className={styles.rank}>Rank</div>
              <div className={styles.profile}>Profile</div>
              <div className={styles.elo}>ELO</div>
            </div>
            
            {profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <div key={profile._id} className={styles.tableRow}>
                  <div className={styles.rank}>{index + 1}</div>
                  <div className={styles.profile}>
                    <div className={styles.profileImage}>
                      {profile.profilePictureUrl ? (
                        <img 
                          src={profile.profilePictureUrl} 
                          alt={profile.name}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder} />
                      )}
                    </div>
                    <div className={styles.profileName}>{profile.name}</div>
                  </div>
                  <div className={styles.elo}>{profile.elo}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No profiles found</div>
            )}
          </div>
        )}
      </main>
      
      <footer className={styles.footer}>
        <p>Logos provided by <a href="https://logo.dev">Logo.dev</a></p>
      </footer>
    </div>
  );
} 