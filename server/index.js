// server/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (_req, res) => res.send('🚀 LinkedInAura API is live'));

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
