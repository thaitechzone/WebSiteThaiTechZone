/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: ระบบชำระเงินผ่าน Stripe
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../database/db');
const { verifyToken } = require('./auth');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/payment/create-checkout:
 *   post:
 *     summary: สร้าง Stripe Checkout Session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enrollmentId]
 *             properties:
 *               enrollmentId:
 *                 type: string
 *                 description: enrollment_id หรือ id ของ enrollment
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Checkout session สำเร็จ — redirect ไปที่ url
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId: { type: string }
 *                 url: { type: string, description: URL สำหรับ redirect ไปหน้า Stripe }
 *       404:
 *         description: ไม่พบ enrollment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/create-checkout', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { enrollmentId, courseId } = req.body;

    // Find user
    const user = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get enrollment and course details
    const enrollment = await pool.query(
      `SELECT e.*, c.title, c.price
       FROM enrollment e
       JOIN courses c ON e.course_id = c.id
       WHERE e.enrollment_id = $1 OR e.id = $1`,
      [enrollmentId]
    );

    if (enrollment.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollmentData = enrollment.rows[0];

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: enrollmentData.title,
              description: `Thai Tech Zone Course - ${enrollmentData.title}`
            },
            unit_amount: Math.round(enrollmentData.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: user.rows[0].email,
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: user.rows[0].id,
        enrollmentId: enrollmentData.id,
        courseId: enrollmentData.course_id
      }
    });

    // Save payment record
    const paymentId = uuidv4();
    await pool.query(
      `INSERT INTO payments
       (payment_id, user_id, enrollment_id, amount, status, payment_method, stripe_charge_id, description)
       VALUES ($1, $2, $3, $4, 'pending', 'stripe', $5, $6)`,
      [paymentId, user.rows[0].id, enrollmentData.id, enrollmentData.price, session.id, `Stripe checkout - ${enrollmentData.title}`]
    );

    res.json({
      sessionId: session.id,
      clientSecret: session.client_secret,
      url: session.url
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe Webhook (ไม่ต้องเรียกเอง — Stripe เรียกอัตโนมัติ)
 *     tags: [Payment]
 *     description: Stripe จะเรียก endpoint นี้เมื่อมีเหตุการณ์ payment สำเร็จหรือล้มเหลว
 *     responses:
 *       200:
 *         description: รับ event สำเร็จ
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object;

      // Find payment record
      const payment = await pool.query(
        'SELECT id, enrollment_id, user_id FROM payments WHERE stripe_charge_id = $1',
        [charge.payment_intent]
      );

      if (payment.rows.length > 0) {
        // Update payment status
        await pool.query(
          `UPDATE payments
           SET status = 'completed', paid_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [payment.rows[0].id]
        );

        // Mark enrollment as active
        await pool.query(
          `UPDATE enrollment
           SET status = 'active'
           WHERE id = $1`,
          [payment.rows[0].enrollment_id]
        );

        console.log('✅ Payment completed:', charge.id);
      }
    }

    // Handle charge.failed event
    if (event.type === 'charge.failed') {
      const charge = event.data.object;

      // Update payment status
      const payment = await pool.query(
        'UPDATE payments SET status = $1 WHERE stripe_charge_id = $2 RETURNING id',
        ['failed', charge.payment_intent]
      );

      console.log('❌ Payment failed:', charge.id);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

/**
 * @swagger
 * /api/payment/status/{id}:
 *   get:
 *     summary: ตรวจสอบสถานะการชำระเงิน
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: payment_id (UUID) หรือ id (integer)
 *         example: 1
 *     responses:
 *       200:
 *         description: ข้อมูลการชำระเงิน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payment' }
 *       404:
 *         description: ไม่พบข้อมูลการชำระเงิน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/status/:id', verifyToken, async (req, res) => {
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

    // Get payment
    const payment = await pool.query(
      'SELECT * FROM payments WHERE (payment_id = $1 OR id = $1) AND user_id = $2',
      [id, user.rows[0].id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ data: payment.rows[0] });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
