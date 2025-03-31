const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  // Optional: Add common variations of company names
  aliases: [{
    type: String
  }]
});

module.exports = mongoose.model('Company', companySchema); 