import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, LoginActivity } from '../models/index.js';

const router = express.Router();

const DEMO_ADMIN = {
  username: 'admin',
  email: 'admin@demo.com',
  password: 'admin123',
  role: 'admin',
};

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const safeLogLogin = async (email, status) => {
  try {
    if (!LoginActivity) return;
    await LoginActivity.create({ email, status });
  } catch (err) {
    console.warn('LoginActivity log failed:', err.message);
  }
};

const ensureDemoAdmin = async () => {
  let user = await User.findOne({
    where: {
      [Op.or]: [
        { email: DEMO_ADMIN.email },
        { username: DEMO_ADMIN.username },
      ],
    },
  });

  if (user) {
    let changed = false;

    if (user.email !== DEMO_ADMIN.email) {
      user.email = DEMO_ADMIN.email;
      changed = true;
    }

    if (user.username !== DEMO_ADMIN.username) {
      user.username = DEMO_ADMIN.username;
      changed = true;
    }

    if (user.role !== 'admin') {
      user.role = 'admin';
      changed = true;
    }

    if (changed) {
      await user.save();
    }

    return user;
  }

  user = await User.create({
    username: DEMO_ADMIN.username,
    email: DEMO_ADMIN.email,
    password: DEMO_ADMIN.password,
    role: 'admin',
  });

  return user;
};

// LOGIN
router.post('/login', async (req, res) => {
  try {
    await ensureDemoAdmin();

    const { email, username, password } = req.body || {};
    const loginValue = String(email || username || '').trim().toLowerCase();

    if (!loginValue || !password) {
      return res.status(400).json({
        error: 'Email/username and password are required',
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginValue },
          { username: loginValue },
        ],
      },
    });

    if (!user) {
      await safeLogLogin(loginValue, 'FAILED_USER_NOT_FOUND');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);

    if (!ok) {
      await safeLogLogin(user.email || loginValue, 'FAILED_WRONG_PASSWORD');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    await safeLogLogin(user.email || loginValue, 'SUCCESS');

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, role } = req.body || {};

    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanUsername || !cleanPassword || !cleanEmail) {
      return res.status(400).json({
        error: 'Username, password, and email are required',
      });
    }

    const existing = await User.findOne({
      where: {
        [Op.or]: [
          { username: cleanUsername },
          { email: cleanEmail },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'Username or email already exists',
      });
    }

    const user = await User.create({
      username: cleanUsername,
      password: cleanPassword,
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'User created',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/register failed:', err);
    return res.status(400).json({ error: err.message });
  }
});

// ME
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'role'],
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.json({
      user,
    });
  } catch (err) {
    console.error('GET /api/auth/me failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;