import express from 'express';
import { User, UserProfile } from '../models/index.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_ROLE_ID = 1;
const DEFAULT_LEVEL_ID = 1;
const DEFAULT_JOB_TITLE_ID = 1;

const normalizeString = (value, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const normalizeNullableInt = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = await UserProfile.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = await UserProfile.create({
        user_id: userId,
        name: normalizeString(user.username, 'Admin'),
        surname: '',
        role_id: DEFAULT_ROLE_ID,
        level_id: DEFAULT_LEVEL_ID,
        job_title_id: DEFAULT_JOB_TITLE_ID,
        image_url: '',
      });
    } else {
      let changed = false;

      if (!profile.name || !String(profile.name).trim()) {
        profile.name = normalizeString(user.username, 'Admin');
        changed = true;
      }

      if (profile.role_id === null || profile.role_id === undefined) {
        profile.role_id = DEFAULT_ROLE_ID;
        changed = true;
      }

      if (profile.level_id === null || profile.level_id === undefined) {
        profile.level_id = DEFAULT_LEVEL_ID;
        changed = true;
      }

      if (profile.job_title_id === null || profile.job_title_id === undefined) {
        profile.job_title_id = DEFAULT_JOB_TITLE_ID;
        changed = true;
      }

      if (profile.image_url === null || profile.image_url === undefined) {
        profile.image_url = '';
        changed = true;
      }

      if (changed) {
        await profile.save();
      }
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error('GET /api/profile/me failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      surname,
      role_id,
      level_id,
      job_title_id,
      image_url,
      username,
      email,
    } = req.body || {};

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextUsername = normalizeString(username, user.username);
    const nextEmail = normalizeString(email, user.email).toLowerCase();

    if (nextUsername) user.username = nextUsername;
    if (nextEmail) user.email = nextEmail;

    await user.save();

    let profile = await UserProfile.findOne({
      where: { user_id: userId },
    });

    const payload = {
      user_id: userId,
      name: normalizeString(name, user.username || 'Admin'),
      surname: normalizeString(surname, ''),
      role_id: normalizeNullableInt(role_id, DEFAULT_ROLE_ID),
      level_id: normalizeNullableInt(level_id, DEFAULT_LEVEL_ID),
      job_title_id: normalizeNullableInt(job_title_id, DEFAULT_JOB_TITLE_ID),
      image_url: typeof image_url === 'string' ? image_url : '',
    };

    if (!profile) {
      profile = await UserProfile.create(payload);
    } else {
      profile.name = payload.name;
      profile.surname = payload.surname;
      profile.role_id = payload.role_id;
      profile.level_id = payload.level_id;
      profile.job_title_id = payload.job_title_id;
      profile.image_url = payload.image_url;
      await profile.save();
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error('PUT /api/profile/me failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;