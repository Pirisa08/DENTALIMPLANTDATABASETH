import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};