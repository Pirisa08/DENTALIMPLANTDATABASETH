import express from 'express';
import { Feedback } from '../models/index.js';

const router = express.Router();

const VALID_STATUSES = ['new', 'in_progress', 'resolved'];

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const entry = await Feedback.create({ name, email, subject, message });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status } = req.query || {};
    const where = {};

    if (status && status !== 'all') {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status filter.' });
      }
      where.status = status;
    }

    const items = await Feedback.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply, responder } = req.body || {};

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status must be new, in_progress, or resolved.' });
    }

    const entry = await Feedback.findByPk(id);
    if (!entry) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    entry.status = status;
    if (typeof adminReply === 'string') {
      entry.adminReply = adminReply.trim() || null;
      entry.responder = responder?.trim() || entry.responder || null;
      entry.respondedAt = entry.adminReply ? new Date() : entry.respondedAt;
    }
    await entry.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, responder } = req.body || {};

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ error: 'Reply message is required.' });
    }

    const entry = await Feedback.findByPk(id);
    if (!entry) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    entry.adminReply = adminReply.trim();
    entry.responder = responder?.trim() || 'Admin';
    entry.respondedAt = new Date();
    entry.status = 'resolved';
    await entry.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
