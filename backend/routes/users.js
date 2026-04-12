/**
 * @swagger
 * tags:
 *   name: Users
 *   description: จัดการข้อมูลผู้ใช้
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: ดูโปรไฟล์ของตัวเอง
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await pool.query(
      `SELECT id, user_id, email, first_name, last_name, phone, profile_picture_url, bio, role, email_verified, created_at, last_login
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: แก้ไขโปรไฟล์
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               bio: { type: string }
 *               profilePictureUrl: { type: string }
 *               currentPassword: { type: string, description: ต้องใส่ถ้าจะเปลี่ยน password }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phone, bio, profilePictureUrl, currentPassword, newPassword } = req.body;

    // Get user
    const user = await pool.query(
      'SELECT id, password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to change password' });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.rows[0].password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password if provided
    let newPasswordHash = null;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      newPasswordHash = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           bio = COALESCE($4, bio),
           profile_picture_url = COALESCE($5, profile_picture_url),
           password_hash = COALESCE($6, password_hash),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING user_id, email, first_name, last_name, phone, profile_picture_url, bio, role`,
      [firstName, lastName, phone, bio, profilePictureUrl, newPasswordHash, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      data: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/users/profile/{userId}:
 *   get:
 *     summary: ดูโปรไฟล์ผู้ใช้ (public)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: ข้อมูล public ของผู้ใช้
 *       404:
 *         description: ไม่พบผู้ใช้
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await pool.query(
      `SELECT user_id, first_name, last_name, profile_picture_url, bio, role
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user.rows[0] });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
