const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const api = {
  // REMOVED: No longer fetching generic profiles this way from main battle page
  // async getProfiles() {
  //   const response = await fetch(`${API_URL}/profiles`);
  //   return response.json();
  // },

  // NEW: Function to get a specific battle pair and token
  async getBattlePair() {
    const response = await fetch(`${API_URL}/battle/pair`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json(); // Expects { profiles: [p1, p2], battleToken: '...' }
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
    const response = await fetch(`${API_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
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

  // Modified: recordBattleResult now requires a battleToken
  async recordBattleResult(winnerId, loserId, battleToken) {
    const response = await fetch(`${API_URL}/battles/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ winnerId, loserId, battleToken }) // Include token in body
    });
    if (!response.ok) {
      // Handle API errors (e.g., 400, 403, 404, 500)
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json(); // Returns { winner: updatedWinnerProfile, loser: updatedLoserProfile }
  }
}; 