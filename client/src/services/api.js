const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const api = {
  async getProfiles() {
    const response = await fetch(`${API_URL}/profiles`);
    return response.json();
  },

  async getProfile(id) {
    const response = await fetch(`${API_URL}/profiles/${id}`);
    return response.json();
  },

  async searchCompany(name) {
    const response = await fetch(`${API_URL}/companies/search?name=${encodeURIComponent(name)}`);
    return response.json();
  },

  async createProfile(profileData) {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    return response.json();
  },

  async updateProfile(id, profileData) {
    // Retrieve the API key from environment variables
    const apiKey = process.env.REACT_APP_ADMIN_API_KEY;
    if (!apiKey) {
      console.error("Error: REACT_APP_ADMIN_API_KEY environment variable not set.");
      // Handle the error appropriately - maybe throw an error or return a specific object
      // For now, just returning an error object to prevent proceeding
      return { error: true, message: "Admin API Key not configured on client." };
    }

    const response = await fetch(`${API_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-api-key': apiKey // <-- Add the API key header
      },
      body: JSON.stringify(profileData)
    });
    // Improved error handling for the fetch response
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error(`API Error (${response.status}):`, errorBody);
      throw new Error(`Failed to update profile (${response.status}): ${errorBody.message || 'Unknown error'}`);
    }
    return response.json();
  },

  async refreshAllLogos() {
    const response = await fetch(`${API_URL}/profiles/refresh-all-logos`, {
      method: 'POST'
    });
    return response.json();
  },

  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${API_URL}/profiles/leaderboard?limit=${limit}`);
      const data = await response.json();
      console.log('Leaderboard API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  async updateElo(winnerId, loserId) {
    // 1. Fetch current profiles to get ELO scores
    let winnerProfile, loserProfile;
    try {
      // Use Promise.all for parallel fetching
      [winnerProfile, loserProfile] = await Promise.all([
        this.getProfile(winnerId),
        this.getProfile(loserId)
      ]);

      // Check if profiles were fetched successfully
      if (!winnerProfile || winnerProfile.error || !loserProfile || loserProfile.error) {
        console.error('Error fetching profiles for ELO update', { winnerProfile, loserProfile });
        throw new Error('Could not fetch one or both profiles for ELO update.');
      }
    } catch (error) {
      console.error('Failed to fetch profiles for ELO update:', error);
      throw error; // Re-throw the error to be caught by the caller
    }

    const winnerElo = winnerProfile.elo;
    const loserElo = loserProfile.elo;

    // 2. Calculate ELO change (Standard Elo formula)
    const kFactor = 32; // K-factor determines how much Elo changes
    const winnerExpected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const loserExpected = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const winnerNewElo = Math.round(winnerElo + kFactor * (1 - winnerExpected));
    const loserNewElo = Math.round(loserElo + kFactor * (0 - loserExpected));

    const winnerEloChange = winnerNewElo - winnerElo;
    const loserEloChange = loserNewElo - loserElo;

    // 3. Update profiles using the modified updateProfile function (which now includes API key)
    try {
      await Promise.all([
        this.updateProfile(winnerId, { elo: winnerNewElo }),
        this.updateProfile(loserId, { elo: loserNewElo })
      ]);
      
      // Return the calculated changes
      return {
        winnerEloChange,
        loserEloChange
      };
    } catch (error) {
      console.error('Failed to update ELO scores via API:', error);
      // Handle the error appropriately - maybe return an error object or throw
      throw new Error(`Failed to update ELO scores: ${error.message}`);
    }
  }
}; 