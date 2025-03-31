import { useState } from 'react';
import { api } from '../services/api';

export default function AddProfileForm({ onProfileAdded }) {
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    name: '',
    profilePictureUrl: '',
    graduationYear: '',
    major: '',
    experiences: [{
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false
    }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setFormData({ ...formData, experiences: newExperiences });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false
      }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.createProfile(formData);
      onProfileAdded(response);
      // Reset form
      setFormData({
        linkedinUrl: '',
        name: '',
        profilePictureUrl: '',
        graduationYear: '',
        major: '',
        experiences: [{
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          current: false
        }]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-profile-form">
      <h2>Add LinkedIn Profile</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          placeholder="LinkedIn URL"
          required
        />
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          type="url"
          value={formData.profilePictureUrl}
          onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
          placeholder="Profile Picture URL"
        />
        <input
          type="number"
          value={formData.graduationYear}
          onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
          placeholder="Graduation Year"
          required
        />
        <input
          type="text"
          value={formData.major}
          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
          placeholder="Major"
          required
        />

        <h3>Experiences</h3>
        {formData.experiences.map((exp, index) => (
          <div key={index} className="experience-inputs">
            <input
              type="text"
              value={exp.title}
              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
              placeholder="Title"
              required
            />
            <input
              type="text"
              value={exp.company}
              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
              placeholder="Company"
              required
            />
            <input
              type="text"
              value={exp.startDate}
              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
              placeholder="Start Date (e.g., January 2024)"
              required
            />
            <input
              type="text"
              value={exp.endDate}
              onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
              placeholder="End Date (leave empty if current)"
            />
            <label>
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
              />
              Current Position
            </label>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="secondary">
          Add Another Experience
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Profile'}
        </button>
      </form>
    </div>
  );
} 