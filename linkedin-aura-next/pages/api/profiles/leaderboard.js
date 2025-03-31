import { connectDB } from '../../../lib/db';
import Profile from '../../../models/Profile';

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const profiles = await Profile.find()
        .sort({ elo: -1 })
        .limit(limit);
      
      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 