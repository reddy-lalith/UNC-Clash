const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  linkedinUrl: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  graduationYear: {
    type: Number,
    required: true
  },
  education: {
    majors: [{
      type: String,
      required: true
    }],
    schools: [{
      type: String,
      required: true
    }]
  },
  elo: {
    type: Number,
    default: 1000
  },
  experiences: [{
    title: String,
    company: String,
    companyLogo: String,
    startDate: String,
    endDate: String,
    current: Boolean
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema); 