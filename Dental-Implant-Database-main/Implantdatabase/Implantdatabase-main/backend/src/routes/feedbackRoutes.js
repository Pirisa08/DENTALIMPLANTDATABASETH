import express from 'express';
import { Feedback } from '../models/index.js';
import nodemailer from 'nodemailer'; // 👈 1. Import nodemailer เข้ามา


const router = express.Router();

// 👈 2. ตั้งค่าตัวส่งอีเมล (ดึงค่าจากไฟล์ .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const VALID_STATUSES = ['new', 'in_progress', 'resolved'];

// 📍 Route ที่ 1: ตอน User กดส่ง Feedback เข้ามาใหม่
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const entry = await Feedback.create({ name, email, subject, message });

    // 📩 [เพิ่มใหม่] ส่งอีเมลแจ้งเตือนกลับไปหา User ว่า "เรารับเรื่องแล้ว"
    try {
      console.log(`กำลังส่งอีเมลยืนยันการรับเรื่องไปที่: ${entry.email}`);
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: entry.email,
        subject: 'เราได้รับข้อความของคุณแล้ว',
        text: `สวัสดีคุณ ${entry.name},\n\nเราได้รับข้อความของคุณเรื่อง "${entry.subject}" เรียบร้อยแล้ว ทีมงานจะรีบตรวจสอบและติดต่อกลับโดยเร็วที่สุด\n\nรายละเอียดข้อความของคุณ:\n${entry.message}`
      });
      console.log("✅ ส่งอีเมลยืนยันให้ User สำเร็จ!");
    } catch (mailErr) {
      console.error("❌ ส่งอีเมลยืนยันไม่สำเร็จ สาเหตุ:", mailErr);
    }

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📍 Route ที่ 2: ดึงข้อมูล Feedback ทั้งหมด (โค้ดเดิม)
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

// 📍 Route ที่ 3: อัปเดตสถานะ (โค้ดเดิม)
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

// 📍 Route ที่ 4: ตอน Admin กดตอบกลับ (Reply) หา User
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

    // 📩 [เพิ่มใหม่] ส่งอีเมลแจ้งเตือน User ว่า "Admin ตอบกลับแล้ว"
    try {
      console.log(`กำลังส่งอีเมลตอบกลับไปที่: ${entry.email}`);
      const info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: entry.email,
        subject: `[ตอบกลับจากแอดมิน] เรื่อง: ${entry.subject}`,
        text: `สวัสดีคุณ ${entry.name},\n\nมีการตอบกลับข้อความของคุณจากทีมงาน (${entry.responder}) ดังนี้:\n\n"${entry.adminReply}"\n\nขอบคุณครับ`
      });
      console.log("✅ ส่งอีเมลตอบกลับสำเร็จ! Message ID:", info.messageId);
    } catch (mailErr) {
      console.error("❌ ส่งอีเมลตอบกลับไม่สำเร็จ สาเหตุ:", mailErr);
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;