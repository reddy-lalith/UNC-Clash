import { connectDB } from '../../../lib/db';
import Profile from '../../../models/Profile';

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === 'GET') {
    try {
      const profiles = await Profile.find().sort({ updatedAt: -1 });
      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const profile = new Profile(req.body);
      await profile.save();
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 