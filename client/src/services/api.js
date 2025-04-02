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

  // New function to record battle results
  async recordBattle(winnerId, loserId) {
    const response = await fetch(`${API_URL}/battles`, { // Use the new /battles endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ winnerId, loserId }) // Send only winnerId and loserId
    });
    // Check for non-OK response and throw error
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
        throw new Error(errorData.error || `Battle recording failed: ${response.statusText}`);
    }
    return response.json(); // Return the updated winner/loser profiles
  }
}; 