/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard และการจัดการระบบ (Admin เท่านั้น)
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');

// Middleware: Check admin role
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: ดูสถิติ dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สถิติระบบ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: integer }
 *                     totalCourses: { type: integer }
 *                     totalEnrollments: { type: integer }
 *                     totalRevenue: { type: number }
 *                 recentPayments:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 *                 courseStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title: { type: string }
 *                       course_code: { type: string }
 *                       total_students: { type: integer }
 */
router.get('/dashboard', verifyToken, checkAdmin, async (req, res) => {
  try {
    // Total users
    const usersCount = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Total courses
    const coursesCount = await pool.query(
      'SELECT COUNT(*) as count FROM courses'
    );

    // Total enrollments
    const enrollmentsCount = await pool.query(
      'SELECT COUNT(*) as count FROM enrollment'
    );

    // Total revenue
    const revenue = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = $1',
      ['completed']
    );

    // Recent payments
    const recentPayments = await pool.query(
      `SELECT p.*, u.email, c.title
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN enrollment e ON p.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE p.status = 'completed'
       ORDER BY p.paid_at DESC
       LIMIT 10`
    );

    // Course enrollment stats
    const courseStats = await pool.query(
      `SELECT c.title, c.course_code, COUNT(e.id) as total_students
       FROM courses c
       LEFT JOIN enrollment e ON c.id = e.course_id
       GROUP BY c.id, c.title, c.course_code
       ORDER BY total_students DESC`
    );

    res.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalCourses: parseInt(coursesCount.rows[0].count),
        totalEnrollments: parseInt(enrollmentsCount.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].total)
      },
      recentPayments: recentPayments.rows,
      courseStats: courseStats.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: ดูรายการผู้ใช้ทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *           default: student
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: รายการผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/users', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role = 'student' } = req.query;

    const offset = (page - 1) * limit;
    const users = await pool.query(
      `SELECT id, user_id, email, first_name, last_name, role, is_active, created_at, last_login
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [role, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      [role]
    );

    res.json({
      data: users.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/admin/enrollments:
 *   get:
 *     summary: ดูรายการ enrollment ทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped, pending]
 *           default: active
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: รายการ enrollment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Enrollment' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/enrollments', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const offset = (page - 1) * limit;
    const enrollments = await pool.query(
      `SELECT e.*, u.email, u.first_name, u.last_name, c.title, c.course_code
       FROM enrollment e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.status = $1
       ORDER BY e.enrollment_date DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM enrollment WHERE status = $1',
      [status]
    );

    res.json({
      data: enrollments.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: ดูรายการ payment ทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           default: completed
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: รายการ payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/payments', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'completed' } = req.query;

    const offset = (page - 1) * limit;
    const payments = await pool.query(
      `SELECT p.*, u.email, u.first_name, u.last_name, c.title
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN enrollment e ON p.enrollment_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE p.status = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE status = $1',
      [status]
    );

    res.json({
      data: payments.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
