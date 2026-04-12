/**
 * @swagger
 * tags:
 *   name: Enrollment
 *   description: ลงทะเบียนและจัดการคอร์สของผู้ใช้
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/enrollment/enroll:
 *   post:
 *     summary: ลงทะเบียนคอร์ส
 *     tags: [Enrollment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: course_id (UUID) หรือ id (integer)
 *                 example: "1"
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Enrollment' }
 *                 requiresPayment: { type: boolean }
 *       409:
 *         description: ลงทะเบียนแล้ว
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/enroll', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId } = req.body;

    // Find user and course IDs
    const user = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const course = await pool.query(
      'SELECT id, price FROM courses WHERE course_id = $1 OR id = $1',
      [courseId]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await pool.query(
      'SELECT id FROM enrollment WHERE user_id = $1 AND course_id = $2',
      [user.rows[0].id, course.rows[0].id]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollmentId = uuidv4();
    const newEnrollment = await pool.query(
      `INSERT INTO enrollment (enrollment_id, user_id, course_id, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [enrollmentId, user.rows[0].id, course.rows[0].id]
    );

    // Update course current_students
    await pool.query(
      'UPDATE courses SET current_students = current_students + 1 WHERE id = $1',
      [course.rows[0].id]
    );

    // If free course, mark payment as completed
    if (course.rows[0].price === 0 || course.rows[0].price === null) {
      const paymentId = uuidv4();
      await pool.query(
        `INSERT INTO payments
         (payment_id, user_id, enrollment_id, amount, status, payment_method, description)
         VALUES ($1, $2, $3, 0, 'completed', 'free', 'Free course enrollment')`,
        [paymentId, user.rows[0].id, newEnrollment.rows[0].id]
      );
    }

    res.status(201).json({
      message: 'Enrollment successful',
      data: newEnrollment.rows[0],
      requiresPayment: course.rows[0].price > 0
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/enrollment/my-courses:
 *   get:
 *     summary: ดูคอร์สที่ลงทะเบียนของฉัน
 *     tags: [Enrollment]
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
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: รายการคอร์สที่ลงทะเบียน
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
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status = 'active', page = 1, limit = 10 } = req.query;

    // Find user
    const user = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get enrollments
    const offset = (page - 1) * limit;
    const enrollments = await pool.query(
      `SELECT e.*, c.title, c.description, c.thumbnail_url, c.category, c.level, c.total_lessons
       FROM enrollment e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1 AND e.status = $2
       ORDER BY e.enrollment_date DESC
       LIMIT $3 OFFSET $4`,
      [user.rows[0].id, status, limit, offset]
    );

    res.json({
      data: enrollments.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/enrollment/{id}:
 *   get:
 *     summary: ดูรายละเอียด enrollment
 *     tags: [Enrollment]
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
 *         description: รายละเอียด enrollment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Enrollment' }
 *       404:
 *         description: ไม่พบ enrollment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Find user
    const user = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get enrollment
    const enrollment = await pool.query(
      `SELECT e.*, c.title, c.description, c.total_lessons
       FROM enrollment e
       JOIN courses c ON e.course_id = c.id
       WHERE (e.enrollment_id = $1 OR e.id = $1) AND e.user_id = $2`,
      [id, user.rows[0].id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ data: enrollment.rows[0] });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/enrollment/{id}/progress:
 *   put:
 *     summary: อัปเดต progress ของคอร์ส
 *     tags: [Enrollment]
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
 *             required: [progressPercentage]
 *             properties:
 *               progressPercentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 50
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ (ถ้า 100% จะ mark เป็น completed)
 */
router.put('/:id/progress', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { progressPercentage } = req.body;

    // Find user
    const user = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update progress
    const updatedEnrollment = await pool.query(
      `UPDATE enrollment
       SET progress_percentage = $1
       WHERE (enrollment_id = $2 OR id = $2) AND user_id = $3
       RETURNING *`,
      [progressPercentage, id, user.rows[0].id]
    );

    if (updatedEnrollment.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // If completed
    if (progressPercentage >= 100) {
      await pool.query(
        `UPDATE enrollment
         SET status = 'completed', completion_date = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [updatedEnrollment.rows[0].id]
      );
    }

    res.json({
      message: 'Progress updated',
      data: updatedEnrollment.rows[0]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/enrollment/{id}:
 *   delete:
 *     summary: ยกเลิกการลงทะเบียน
 *     tags: [Enrollment]
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
 *         description: ยกเลิกสำเร็จ
 *       404:
 *         description: ไม่พบ enrollment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Find user
    const user = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get enrollment
    const enrollment = await pool.query(
      'SELECT course_id FROM enrollment WHERE (enrollment_id = $1 OR id = $1) AND user_id = $2',
      [id, user.rows[0].id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Delete enrollment
    await pool.query(
      'DELETE FROM enrollment WHERE (enrollment_id = $1 OR id = $1) AND user_id = $2',
      [id, user.rows[0].id]
    );

    // Update course current_students
    await pool.query(
      'UPDATE courses SET current_students = current_students - 1 WHERE id = $1',
      [enrollment.rows[0].course_id]
    );

    res.json({ message: 'Enrollment cancelled' });
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
