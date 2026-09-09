import express from 'express';
import { Feedback } from '../models/index.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const router = express.Router();

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const transporter = mailUser && mailPass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    })
  : null;

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

    if (transporter) {
      try {
        await transporter.sendMail({
          from: mailUser,
          to: entry.email,
          subject: `Official Reply from MFU Dental Implant Database Team : ${entry.subject}`,
          text: `Dear ${entry.name},\n\nThank you for contacting MFU Dental Implant Database team.\n\nThis is an official reply from ${entry.responder}.\n\n${entry.adminReply}\n\nIf you need any further assistance, please feel free to contact us again.\n\nSincerely,\nImplant Database Team\nMae Fah Luang University`,
        });
      } catch (mailErr) {
        console.error('❌ ส่งอีเมลตอบกลับไม่สำเร็จ สาเหตุ:', mailErr);
      }
    } else {
      console.warn('MAIL_USER หรือ MAIL_PASS ยังไม่ถูกตั้งค่า จึงข้ามการส่งอีเมลตอบกลับ');
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
