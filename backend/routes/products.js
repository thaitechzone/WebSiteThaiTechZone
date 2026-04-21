const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// GET /api/products — public listing
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM products WHERE is_available = true';
    const params = [];
    let n = 1;

    if (category) { query += ` AND category = $${n++}`; params.push(category); }
    if (featured === 'true') { query += ` AND is_featured = true`; }
    if (search) { query += ` AND (name ILIKE $${n} OR description ILIKE $${n})`; params.push(`%${search}%`); n++; }

    const offset = (page - 1) * limit;
    query += ` ORDER BY is_featured DESC, created_at DESC LIMIT $${n} OFFSET $${n + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countRes = await pool.query('SELECT COUNT(*) FROM products WHERE is_available = true');
    res.json({ data: result.rows, pagination: { total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id — public detail
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products — admin create
router.post('/', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name, description, sku, category, price, stockQuantity, images, specs, isAvailable, isFeatured } = req.body;
    if (!name || !sku) return res.status(400).json({ error: 'name and sku are required' });

    const result = await pool.query(
      `INSERT INTO products (name, description, sku, category, price, stock_quantity, images, specs, is_available, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, description, sku, category || 'development_board', price || 0,
       stockQuantity || 0, JSON.stringify(images || []), JSON.stringify(specs || {}),
       isAvailable !== false, isFeatured || false]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU already exists' });
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id — admin update
router.put('/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name, description, sku, category, price, stockQuantity, images, specs, isAvailable, isFeatured } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, sku=$3, category=$4, price=$5,
       stock_quantity=$6, images=$7, specs=$8, is_available=$9, is_featured=$10, updated_at=NOW()
       WHERE product_id=$11 RETURNING *`,
      [name, description, sku, category, price, stockQuantity,
       JSON.stringify(images || []), JSON.stringify(specs || {}),
       isAvailable, isFeatured, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id — admin delete
router.delete('/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE product_id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
