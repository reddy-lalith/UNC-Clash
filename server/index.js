// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const Profile = require('./models/Profile');
const Company = require('./models/Company');
const { getOrCreateCompany } = require('./utils/companyUtils');
const path = require('path');
const crypto = require('crypto'); // Import crypto for token generation
const app = express();
const PORT = process.env.PORT || 4000;

// --- In-Memory Store for Pending Battles ---
// NOTE: This will not persist across server restarts.
// For production, consider Redis or a database.
const pendingBattles = {}; 
const BATTLE_TOKEN_EXPIRY_MS = 4000; // 4 seconds validity (reduced from 5 min)

// Function to generate secure tokens
const generateBattleToken = () => crypto.randomBytes(16).toString('hex');

// --- Security Middleware ---
app.use(helmet());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL // Allow only the specified frontend domain
    : '*', // Allow all origins in development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// --- General Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve Static Files from React Build ---
// This needs to be defined BEFORE your API routes
// Adjust the path if your build directory is different
app.use(express.static(path.join(__dirname, '../client/build')));

// --- JWT Authentication Middleware ---
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // Expected header: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- Login Route ---
// This route issues a JWT for a valid admin user.
// Clients should POST { username, password } to this endpoint.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check credentials against environment variables
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});

// --- Connect to MongoDB ---
console.log('Attempting to connect to MongoDB...');
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linkedinAura';
console.log(`Using MongoDB URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

mongoose.connect(mongoURI)
  .then(() => console.log('📦 Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check if:');
    console.error('1. Your connection string is correct');
    console.error('2. Network allows the connection');
    console.error('3. Username and password are correct (if using Atlas)');
  });

console.log('Logo API Key available:', !!process.env.LOGO_API_KEY);

// --- Routes ---
// Public Routes
app.get('/', (_req, res) => res.send('🚀 LinkedInAura API is live'));

app.get('/api/profiles', async (req, res) => {
  try {
    const randomCount = parseInt(req.query.count) || 20; // Default to 20 random profiles
    const profiles = await Profile.aggregate([{ $sample: { size: randomCount } }]);
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const profiles = await Profile.find().sort({ elo: -1 }).limit(limit);
    console.log('Leaderboard profiles:', Array.isArray(profiles) ? `Found ${profiles.length} profiles` : `Not an array: ${typeof profiles}`);
    res.json(profiles || []);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/search', async (req, res) => {
  try {
    const { name } = req.query;
    const company = await Company.findOne({
      $or: [
        { name: new RegExp(name, 'i') },
        { aliases: new RegExp(name, 'i') }
      ]
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected Routes (JWT required)
app.post('/api/profiles', authenticateJWT, async (req, res) => {
  try {
    const profileData = req.body;
    // Process each experience to ensure companies exist
    if (profileData.experiences) {
      for (const exp of profileData.experiences) {
        const company = await getOrCreateCompany(exp.company);
        if (company) {
          exp.companyLogo = company.logoUrl;
        }
      }
    }
    const profile = new Profile(profileData);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/profiles/:id', authenticateJWT, async (req, res) => {
  try {
    const profileData = req.body;
    // Process each experience to ensure companies exist
    if (profileData.experiences) {
      for (const exp of profileData.experiences) {
        const company = await getOrCreateCompany(exp.company);
        if (company) {
          exp.companyLogo = company.logoUrl;
        }
      }
    }
    const profile = await Profile.findByIdAndUpdate(req.params.id, profileData, { new: true });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/companies', authenticateJWT, async (req, res) => {
  try {
    const { name, logoUrl, aliases = [] } = req.body;
    const company = new Company({ name, logoUrl, aliases });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/company-domains', authenticateJWT, async (req, res) => {
  try {
    const { companyName, domain } = req.body;
    const company = await Company.findOne({ name: companyName });
    if (company) {
      company.logoUrl = `https://img.logo.dev/${domain}?token=${process.env.LOGO_API_KEY}&format=png`;
      company.domain = domain;
      await company.save();
    }
    res.json({ message: 'Domain mapping updated', company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/profiles/:id', authenticateJWT, async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/profiles', authenticateJWT, async (req, res) => {
  try {
    await Profile.deleteMany({});
    res.json({ message: 'All profiles deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profiles/:id/refresh-logos', authenticateJWT, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (profile.experiences) {
      for (const exp of profile.experiences) {
        const company = await getOrCreateCompany(exp.company);
        if (company) {
          exp.companyLogo = company.logoUrl;
        }
      }
    }
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profiles/refresh-all-logos', authenticateJWT, async (req, res) => {
  try {
    const profiles = await Profile.find();
    let updatedCount = 0;
    for (const profile of profiles) {
      let updated = false;
      if (profile.experiences && Array.isArray(profile.experiences)) {
        for (const exp of profile.experiences) {
          const company = await getOrCreateCompany(exp.company, true);
          if (company) {
            exp.companyLogo = company.logoUrl;
            updated = true;
          }
        }
      }
      if (updated) {
        await profile.save();
        updatedCount++;
      }
    }
    res.json({ success: true, message: `Updated logos for ${updatedCount} profiles` });
  } catch (error) {
    console.error('Error refreshing logos:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh logos' });
  }
});

app.delete('/api/companies', authenticateJWT, async (req, res) => {
  try {
    await Company.deleteMany({});
    res.json({ message: 'All companies deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW ROUTE: Reset ELO for all profiles
app.post('/api/profiles/reset-all-elo', authenticateJWT, async (req, res) => {
  try {
    const result = await Profile.updateMany({}, { $set: { elo: 1000 } });
    console.log(`ELO Reset Result: Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
    res.json({ 
      success: true, 
      message: `Successfully reset ELO to 1000 for profiles.`, 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error resetting ELO scores:', error);
    res.status(500).json({ success: false, error: 'Failed to reset ELO scores' });
  }
});

// NEW ROUTE: Record Battle Result and Update ELO
const calculateEloChange = (winnerElo, loserElo, kFactor = 32) => {
  const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoserScore = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const winnerNewElo = winnerElo + kFactor * (1 - expectedWinnerScore);
  const loserNewElo = loserElo + kFactor * (0 - expectedLoserScore);

  return {
    winnerNewElo: Math.round(winnerNewElo),
    loserNewElo: Math.round(loserNewElo)
  };
};

// NEW Endpoint: Get a pair of profiles and a battle token
app.get('/api/battle/pair', async (req, res) => {
  try {
    // Fetch two distinct random profiles
    const profiles = await Profile.aggregate([{ $sample: { size: 2 } }]);
    if (!profiles || profiles.length < 2) {
      return res.status(500).json({ error: 'Could not fetch enough profiles for a battle' });
    }

    const [profile1, profile2] = profiles;
    const battleToken = generateBattleToken();
    const expiresAt = Date.now() + BATTLE_TOKEN_EXPIRY_MS;

    // Store the pending battle information
    pendingBattles[battleToken] = {
      profile1Id: profile1._id.toString(),
      profile2Id: profile2._id.toString(),
      expiresAt
    };

    // Optional: Clean up expired tokens periodically (simple example)
    // A more robust cleanup would run on a timer
    for (const token in pendingBattles) {
      if (pendingBattles[token].expiresAt < Date.now()) {
        delete pendingBattles[token];
      }
    }

    console.log(`Issued battle token ${battleToken} for ${profile1.name} vs ${profile2.name}`);

    // Return the profiles and the token
    res.json({ profiles: [profile1, profile2], battleToken });

  } catch (error) {
    console.error('Error fetching battle pair:', error);
    res.status(500).json({ error: 'Failed to fetch battle pair' });
  }
});

// Modified: Record Battle Result (Now requires Battle Token)
// Removed authenticateJWT, added token validation
app.post('/api/battles/record', async (req, res) => {
  try {
    // Get token and IDs from request body
    const { winnerId, loserId, battleToken } = req.body;

    if (!winnerId || !loserId || !battleToken) {
      return res.status(400).json({ error: 'Missing winnerId, loserId, or battleToken' });
    }

    // --- Battle Token Validation ---
    const battleInfo = pendingBattles[battleToken];
    if (!battleInfo) {
      console.warn(`Invalid or unknown battle token received: ${battleToken}`);
      return res.status(403).json({ error: 'Invalid or expired battle token' });
    }

    // Check expiry
    if (battleInfo.expiresAt < Date.now()) {
      console.warn(`Expired battle token received: ${battleToken}`);
      delete pendingBattles[battleToken]; // Clean up expired token
      return res.status(403).json({ error: 'Invalid or expired battle token' });
    }

    // Check if IDs match the ones associated with the token
    const expectedIds = [battleInfo.profile1Id, battleInfo.profile2Id];
    if (!expectedIds.includes(winnerId) || !expectedIds.includes(loserId) || winnerId === loserId ) {
      console.warn(`Battle token ${battleToken} used with mismatched IDs: ${winnerId}, ${loserId}. Expected: ${expectedIds}`);
      // Keep token valid for now in case of client error, but reject request
      return res.status(400).json({ error: 'Submitted profile IDs do not match the battle token' });
    }

    // --- Token is valid - consume it immediately ---
    delete pendingBattles[battleToken];
    console.log(`Consumed valid battle token: ${battleToken}`);
    // -----------------------------

    // --- Proceed with existing Elo update logic ---
    const winner = await Profile.findById(winnerId);
    const loser = await Profile.findById(loserId);

    if (!winner || !loser) {
      // This case should be rare if token validation worked, but good to keep
      console.error(`Profile not found after valid token: Winner ${winnerId}, Loser ${loserId}`);
      return res.status(404).json({ error: 'Winner or loser profile not found (internal error)' });
    }

    const { winnerNewElo, loserNewElo } = calculateEloChange(winner.elo, loser.elo);

    winner.elo = winnerNewElo;
    loser.elo = loserNewElo;

    await winner.save();
    await loser.save();

    console.log(`Battle recorded via token: Winner ${winner.name} (${winnerNewElo}), Loser ${loser.name} (${loserNewElo})`);

    // Return updated profiles
    res.json({ winner, loser });

  } catch (error) {
    console.error('Error recording battle result:', error);
    res.status(500).json({ error: 'Failed to record battle result' });
  }
});

// --- Fallback for Client-Side Routing ---
// This should be defined AFTER all API routes
// It ensures that any GET request not matching an API route or a static file
// is served the main index.html file, allowing React Router to handle it.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
