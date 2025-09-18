const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-intent', authenticateToken, authorizeRoles('customer'), async (req, res) => {
  try {
    const { bookingId, amount, currency = 'inr' } = req.body;
    const customerId = req.user.id;
    
    const bookingIdNum = bookingId.replace('bk', '');
    
    // Verify booking belongs to customer
    const booking = await pool.query(`
      SELECT id, total_amount, status, payment_status
      FROM bookings 
      WHERE id = $1 AND customer_id = $2
    `, [bookingIdNum, customerId]);
    
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const bookingData = booking.rows[0];
    
    if (bookingData.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }
    
    // Convert amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: currency,
      metadata: {
        bookingId: bookingId,
        customerId: customerId.toString()
      },
      description: `HouseMate Service Payment - Booking ${bookingId}`
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Process payment
router.post('/process', authenticateToken, authorizeRoles('customer'), async (req, res) => {
  try {
    const { bookingId, paymentMethodId, amount } = req.body;
    const customerId = req.user.id;
    
    const bookingIdNum = bookingId.replace('bk', '');
    
    // Verify booking
    const booking = await pool.query(`
      SELECT id, total_amount, status, payment_status
      FROM bookings 
      WHERE id = $1 AND customer_id = $2
    `, [bookingIdNum, customerId]);
    
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const bookingData = booking.rows[0];
    
    if (bookingData.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }
    
    // For demo purposes, simulate successful payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceUrl = `https://housemate.in/invoices/${paymentId}`;
    
    // Update booking payment status
    await pool.query(`
      UPDATE bookings 
      SET payment_status = 'paid', payment_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [paymentId, bookingIdNum]);
    
    res.json({
      paymentId,
      status: 'succeeded',
      invoiceUrl,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 20, offset = 0 } = req.query;
    
    let query, params;
    
    if (userRole === 'customer') {
      query = `
        SELECT 
          b.id,
          b.total_amount,
          b.payment_id,
          b.payment_status,
          b.created_at,
          b.updated_at,
          sc.name as service_name,
          u.name as provider_name
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.customer_id = $1 AND b.payment_status IN ('paid', 'failed', 'refunded')
        ORDER BY b.updated_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, limit, offset];
    } else if (userRole === 'provider') {
      // Get provider ID
      const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      
      query = `
        SELECT 
          b.id,
          b.total_amount,
          b.payment_id,
          b.payment_status,
          b.created_at,
          b.updated_at,
          sc.name as service_name,
          u.name as customer_name
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.provider_id = $1 AND b.payment_status = 'paid'
        ORDER BY b.updated_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [providerResult.rows[0].id, limit, offset];
    }
    
    const result = await pool.query(query, params);
    
    const payments = result.rows.map(payment => ({
      bookingId: `bk${payment.id}`,
      amount: parseFloat(payment.total_amount),
      paymentId: payment.payment_id,
      status: payment.payment_status,
      serviceName: payment.service_name,
      ...(userRole === 'customer' ? {
        providerName: payment.provider_name
      } : {
        customerName: payment.customer_name
      }),
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    }));
    
    res.json({
      payments,
      total: payments.length,
      hasMore: payments.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get invoice
router.get('/invoice/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = `
      SELECT 
        b.*,
        cu.name as customer_name,
        cu.email as customer_email,
        cu.phone as customer_phone,
        cu.address as customer_address,
        pu.name as provider_name,
        pu.email as provider_email,
        pu.phone as provider_phone,
        sc.name as service_name,
        sc.description as service_description
      FROM bookings b
      JOIN users cu ON b.customer_id = cu.id
      JOIN providers p ON b.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE b.payment_id = $1
    `;
    
    // Add authorization check
    if (userRole === 'customer') {
      query += ` AND b.customer_id = $2`;
    } else if (userRole === 'provider') {
      const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      query += ` AND b.provider_id = $2`;
      userId = providerResult.rows[0].id;
    }
    
    const result = await pool.query(query, userRole === 'admin' ? [paymentId] : [paymentId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const invoice = result.rows[0];
    
    res.json({
      invoiceId: `INV-${invoice.payment_id}`,
      bookingId: `bk${invoice.id}`,
      paymentId: invoice.payment_id,
      customer: {
        name: invoice.customer_name,
        email: invoice.customer_email,
        phone: invoice.customer_phone,
        address: invoice.customer_address
      },
      provider: {
        name: invoice.provider_name,
        email: invoice.provider_email,
        phone: invoice.provider_phone
      },
      service: {
        name: invoice.service_name,
        description: invoice.service_description
      },
      bookingDate: invoice.booking_date,
      duration: parseFloat(invoice.duration_hours),
      amount: parseFloat(invoice.total_amount),
      paymentStatus: invoice.payment_status,
      createdAt: invoice.created_at,
      paidAt: invoice.updated_at,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Webhook for Stripe events (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      console.log('Webhook endpoint secret not configured');
      return res.status(400).send('Webhook endpoint secret not configured');
    }
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId?.replace('bk', '');
        
        if (bookingId) {
          await pool.query(`
            UPDATE bookings 
            SET payment_status = 'paid', payment_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [paymentIntent.id, bookingId]);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedBookingId = failedPayment.metadata.bookingId?.replace('bk', '');
        
        if (failedBookingId) {
          await pool.query(`
            UPDATE bookings 
            SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [failedBookingId]);
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;