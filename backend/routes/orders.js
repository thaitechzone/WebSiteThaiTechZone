const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { verifyToken } = require('./auth');

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// POST /api/orders — create order (auth required)
router.post('/', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, shippingName, shippingPhone, shippingAddress, shippingCity, shippingPostal, paymentMethod, notes } = req.body;
    if (!items?.length || !shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingPostal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Verify products & calculate total
    let totalAmount = 0;
    const resolvedItems = [];
    for (const item of items) {
      const pRes = await client.query('SELECT * FROM products WHERE product_id=$1 AND is_available=true', [item.productId]);
      if (!pRes.rows.length) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Product not found: ${item.productId}` }); }
      const product = pRes.rows[0];
      if (product.stock_quantity < item.quantity) { await client.query('ROLLBACK'); return res.status(400).json({ error: `สินค้า "${product.name}" มีไม่เพียงพอ` }); }
      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;
      resolvedItems.push({ product, quantity: item.quantity, subtotal });
    }

    // Create order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, totalAmount, shippingName, shippingPhone, shippingAddress, shippingCity, shippingPostal, paymentMethod || 'bank_transfer', notes]
    );
    const order = orderRes.rows[0];

    // Insert items & decrement stock
    for (const { product, quantity, subtotal } of resolvedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5)',
        [order.id, product.id, quantity, product.price, subtotal]
      );
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id=$2', [quantity, product.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ data: order, message: 'สั่งซื้อสำเร็จ' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/orders/my — user's own orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const orders = await pool.query(
      `SELECT o.*, json_agg(json_build_object('name', p.name, 'sku', p.sku, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal, 'images', p.images)) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ data: orders.rows });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders — admin: all orders
router.get('/', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT o.*, u.email, u.first_name, u.last_name,
      json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'subtotal', oi.subtotal)) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id`;
    const params = [];
    if (status) { query += ` WHERE o.status = $1`; params.push(status); }
    query += ` GROUP BY o.id, u.email, u.first_name, u.last_name ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countRes = await pool.query(status ? 'SELECT COUNT(*) FROM orders WHERE status=$1' : 'SELECT COUNT(*) FROM orders', status ? [status] : []);
    res.json({ data: result.rows, pagination: { total: parseInt(countRes.rows[0].count) } });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/orders/:id/status — admin update status
router.put('/:id/status', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status=COALESCE($1,status), payment_status=COALESCE($2,payment_status), updated_at=NOW()
       WHERE order_id=$3 RETURNING *`,
      [status, paymentStatus, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
