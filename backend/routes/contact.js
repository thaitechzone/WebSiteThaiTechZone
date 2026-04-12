/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: ระบบติดต่อ / ฝากข้อความ
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Configure email transporter (use your email settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * @swagger
 * /api/contact/submit:
 *   post:
 *     summary: ส่งข้อความติดต่อ
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string, example: สมชาย ใจดี }
 *               email: { type: string, format: email, example: user@example.com }
 *               phone: { type: string, example: "0812345678" }
 *               subject: { type: string, example: สอบถามเรื่องคอร์ส LabVIEW }
 *               message: { type: string, example: อยากทราบว่าคอร์สนี้เหมาะกับผู้เริ่มต้นไหมครับ }
 *     responses:
 *       201:
 *         description: ส่งข้อความสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/ContactMessage' }
 *       400:
 *         description: ข้อมูลไม่ครบ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create contact message record
    const messageId = uuidv4();
    const newMessage = await pool.query(
      `INSERT INTO contact_messages
       (message_id, name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'new')
       RETURNING *`,
      [messageId, name, email, phone || null, subject, message]
    );

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: `Received: ${subject}`,
        html: `
          <h2>ขอบคุณที่ติดต่อเรา</h2>
          <p>สวัสดี ${name},</p>
          <p>เราได้รับข้อความของคุณเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด</p>
          <br>
          <p><strong>หัวข้อ:</strong> ${subject}</p>
          <p><strong>ข้อความ:</strong> ${message}</p>
          <br>
          <p>Thai Tech Zone</p>
        `
      });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }

    // Send notification to admin
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form: ${subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong> ${message}</p>
          <br>
          <p><a href="${process.env.FRONTEND_URL}/admin/contact/${messageId}">View in Admin Panel</a></p>
        `
      });
    } catch (emailError) {
      console.error('Admin notification error:', emailError);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage.rows[0]
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: ดูข้อความทั้งหมด (Admin เท่านั้น)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, read, replied, closed]
 *           default: new
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: รายการข้อความ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ContactMessage' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status = 'new', page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const messages = await pool.query(
      `SELECT * FROM contact_messages
       WHERE status = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM contact_messages WHERE status = $1',
      [status]
    );

    res.json({
      data: messages.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: ดูรายละเอียดข้อความ (Admin เท่านั้น)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 1
 *     responses:
 *       200:
 *         description: รายละเอียดข้อความ (จะ mark เป็น read อัตโนมัติ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/ContactMessage' }
 *       404:
 *         description: ไม่พบข้อความ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const message = await pool.query(
      'SELECT * FROM contact_messages WHERE message_id = $1 OR id = $1',
      [id]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read
    await pool.query(
      'UPDATE contact_messages SET status = CASE WHEN status = $1 THEN $2 ELSE status END WHERE id = $3',
      ['new', 'read', message.rows[0].id]
    );

    res.json({ data: message.rows[0] });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/contact/{id}/reply:
 *   put:
 *     summary: ตอบกลับข้อความ (Admin เท่านั้น)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [replyMessage]
 *             properties:
 *               replyMessage:
 *                 type: string
 *                 example: สวัสดีครับ คอร์สนี้เหมาะสำหรับผู้เริ่มต้นมากครับ
 *     responses:
 *       200:
 *         description: ตอบกลับสำเร็จ (ส่ง email ให้ผู้ถามด้วย)
 *       404:
 *         description: ไม่พบข้อความ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id/reply', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { replyMessage } = req.body;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get message details
    const message = await pool.query(
      'SELECT * FROM contact_messages WHERE message_id = $1 OR id = $1',
      [id]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update message
    const updatedMessage = await pool.query(
      `UPDATE contact_messages
       SET reply_message = $1, replied_at = CURRENT_TIMESTAMP, status = 'replied'
       WHERE id = $2
       RETURNING *`,
      [replyMessage, message.rows[0].id]
    );

    // Send reply email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: message.rows[0].email,
        subject: `Re: ${message.rows[0].subject}`,
        html: `
          <h2>ตอบกลับจากเรา</h2>
          <p>สวัสดี ${message.rows[0].name},</p>
          <p>${replyMessage}</p>
          <br>
          <p>Best regards,<br>Thai Tech Zone Team</p>
        `
      });
    } catch (emailError) {
      console.error('Reply email error:', emailError);
    }

    res.json({
      message: 'Reply sent successfully',
      data: updatedMessage.rows[0]
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
