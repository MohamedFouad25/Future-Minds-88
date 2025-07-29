import { connectDB } from '../utils/db.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { fullName, email, governorate, password, confirmPassword, role, adminCode } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (role === 'admin' && adminCode !== process.env.ADMIN_CODE) {
    return res.status(403).json({ message: 'Invalid Admin Code' });
  }

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const newUser = new User({ fullName, email, governorate, password, role });
  await newUser.save();

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user: newUser });
}
