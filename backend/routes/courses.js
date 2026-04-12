/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: จัดการคอร์สเรียน
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: ดูรายการคอร์สทั้งหมด
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [labview, automation, python, robotics]
 *         description: กรองตาม category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: กรองตามระดับ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: ค้นหาจากชื่อหรือคำอธิบาย
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: รายการคอร์ส
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Course' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM courses WHERE is_published = true';
    let params = [];
    let paramCount = 1;

    // Add filters
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (level) {
      query += ` AND level = $${paramCount}`;
      params.push(level);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const courses = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM courses WHERE is_published = true';
    const countResult = await pool.query(countQuery);
    const totalCourses = parseInt(countResult.rows[0].count);

    res.json({
      data: courses.rows,
      pagination: {
        total: totalCourses,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCourses / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: ดูรายละเอียดคอร์ส
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: course_id (UUID) หรือ id (integer)
 *         example: 1
 *     responses:
 *       200:
 *         description: รายละเอียดคอร์ส
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Course' }
 *       404:
 *         description: ไม่พบคอร์ส
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await pool.query(
      'SELECT * FROM courses WHERE course_id = $1 OR id = $1',
      [id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ data: course.rows[0] });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: สร้างคอร์สใหม่ (Admin เท่านั้น)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, courseCode, category, level]
 *             properties:
 *               title: { type: string, example: Python for Automation }
 *               description: { type: string, example: เรียน Python สำหรับงาน Automation }
 *               courseCode: { type: string, example: PY101 }
 *               category: { type: string, example: python }
 *               level: { type: string, enum: [beginner, intermediate, advanced] }
 *               price: { type: number, example: 1999 }
 *               durationHours: { type: integer, example: 30 }
 *               totalLessons: { type: integer, example: 15 }
 *               maxStudents: { type: integer, example: 50 }
 *               thumbnailUrl: { type: string }
 *     responses:
 *       201:
 *         description: สร้างคอร์สสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Course' }
 *       403:
 *         description: ต้องเป็น Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      title,
      description,
      courseCode,
      category,
      level,
      price,
      durationHours,
      totalLessons,
      maxStudents,
      thumbnailUrl
    } = req.body;

    // Validation
    if (!title || !description || !courseCode || !category || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { v4: uuidv4 } = require('uuid');
    const courseId = uuidv4();

    const newCourse = await pool.query(
      `INSERT INTO courses
       (course_id, title, description, course_code, category, level, price, duration_hours, total_lessons, max_students, thumbnail_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [courseId, title, description, courseCode, category, level, price || 0, durationHours || 0, totalLessons || 0, maxStudents || 100, thumbnailUrl || null, true]
    );

    res.status(201).json({
      message: 'Course created successfully',
      data: newCourse.rows[0]
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: แก้ไขคอร์ส (Admin เท่านั้น)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               level: { type: string }
 *               isPublished: { type: boolean }
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Course' }
 *       403:
 *         description: ต้องเป็น Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: ไม่พบคอร์ส
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, price, level, isPublished } = req.body;

    const updatedCourse = await pool.query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           level = COALESCE($4, level),
           is_published = COALESCE($5, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE course_id = $6 OR id = $6
       RETURNING *`,
      [title, description, price, level, isPublished, id]
    );

    if (updatedCourse.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      data: updatedCourse.rows[0]
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: ลบคอร์ส (Admin เท่านั้น)
 *     tags: [Courses]
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
 *         description: ลบสำเร็จ
 *       403:
 *         description: ต้องเป็น Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: ไม่พบคอร์ส
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Check admin role
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      'DELETE FROM courses WHERE course_id = $1 OR id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
