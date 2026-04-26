// feedbackRoutes.js
import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { Feedback } from '../models/index.js';

const router = express.Router();

// กำหนดสถานะที่ใช้ในความคิดเห็น
const VALID_STATUSES = ['new', 'in_progress', 'resolved'];

// POST: รับความคิดเห็นจากผู้ใช้
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const entry = await Feedback.create({ name, email, subject, message });
    res.status(201).json(entry);  // ส่งข้อมูลที่ถูกบันทึกกลับไป
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: แอดมินตอบกลับความคิดเห็น
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


    // ใช้ค่าจาก .env เพื่อความปลอดภัย
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;
    if (!mailUser || !mailPass) {
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const mailOptions = {
      from: mailUser,
      to: entry.email,
      subject: `Your feedback has been replied: ${entry.subject}`,
      html: `
        <p>Dear ${entry.name},</p>
        <p>The admin has replied to your feedback:</p>
        <blockquote style="background:#f7f7f7;padding:10px 16px;border-radius:8px;border-left:4px solid #2563eb;">${adminReply}</blockquote>
        <p>If you have further questions, you can reply directly to this email or <a href="mailto:${mailUser}">contact the admin</a>.</p>
        <p style="color:#888;font-size:13px;margin-top:18px;">This is an automated message from the Dental Implant Database system.<br>Best regards,<br>Admin Team</p>
      `,
    };


    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.response);
      return res.json(entry);  // ส่งข้อมูลที่อัปเดตกลับไปหน้าบ้าน
    } catch (mailError) {
      console.error('❌ Gmail Sending Error:', mailError); 
      return res.status(500).json({ error: 'Failed to send email. Check Backend Console.' });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
});

export default router;