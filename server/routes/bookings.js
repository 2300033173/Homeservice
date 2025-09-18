const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', authenticateToken, authorizeRoles('customer'), async (req, res) => {
  try {
    const {
      providerId,
      serviceCategoryId,
      bookingDate,
      duration = 1.0,
      customerAddress,
      customerLat,
      customerLng,
      specialInstructions
    } = req.body;

    const customerId = req.user.id;
    const providerIdNum = providerId.replace('prov', '');

    // Get provider details and calculate amount
    const providerResult = await pool.query(`
      SELECT p.hourly_rate, sc.base_price, u.name as provider_name
      FROM providers p
      JOIN service_categories sc ON sc.id = $2
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.kyc_status = 'approved' AND p.is_available = true
    `, [providerIdNum, serviceCategoryId]);

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not available' });
    }

    const provider = providerResult.rows[0];
    const totalAmount = parseFloat(provider.hourly_rate) * parseFloat(duration);

    // Create booking
    const bookingResult = await pool.query(`
      INSERT INTO bookings (
        customer_id, provider_id, service_category_id, booking_date,
        duration_hours, total_amount, customer_address, customer_lat,
        customer_lng, special_instructions, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      customerId, providerIdNum, serviceCategoryId, bookingDate,
      duration, totalAmount, customerAddress, customerLat,
      customerLng, specialInstructions, 'confirmed'
    ]);

    const bookingId = bookingResult.rows[0].id;

    res.status(201).json({
      bookingId: `bk${bookingId}`,
      status: 'confirmed',
      trackingChannel: `socket://channel_bk${bookingId}`,
      totalAmount,
      providerName: provider.provider_name,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, limit = 20, offset = 0 } = req.query;

    let query, params;

    if (userRole === 'customer') {
      query = `
        SELECT 
          b.*,
          u.name as provider_name,
          u.phone as provider_phone,
          sc.name as service_name,
          sc.icon_url as service_icon
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.customer_id = $1
      `;
      params = [userId];
    } else if (userRole === 'provider') {
      // Get provider ID
      const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      
      query = `
        SELECT 
          b.*,
          u.name as customer_name,
          u.phone as customer_phone,
          sc.name as service_name,
          sc.icon_url as service_icon
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.provider_id = $1
      `;
      params = [providerResult.rows[0].id];
    }

    // Add status filter if provided
    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const bookings = result.rows.map(booking => ({
      id: `bk${booking.id}`,
      serviceCategory: booking.service_name,
      serviceIcon: booking.service_icon,
      bookingDate: booking.booking_date,
      duration: parseFloat(booking.duration_hours),
      totalAmount: parseFloat(booking.total_amount),
      status: booking.status,
      paymentStatus: booking.payment_status,
      customerAddress: booking.customer_address,
      specialInstructions: booking.special_instructions,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ...(userRole === 'customer' ? {
        providerName: booking.provider_name,
        providerPhone: booking.provider_phone
      } : {
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone
      })
    }));

    res.json({
      bookings,
      total: bookings.length,
      hasMore: bookings.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id.replace('bk', '');
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        b.*,
        cu.name as customer_name,
        cu.phone as customer_phone,
        cu.email as customer_email,
        pu.name as provider_name,
        pu.phone as provider_phone,
        pu.email as provider_email,
        sc.name as service_name,
        sc.description as service_description,
        sc.icon_url as service_icon,
        p.location_lat as provider_lat,
        p.location_lng as provider_lng
      FROM bookings b
      JOIN users cu ON b.customer_id = cu.id
      JOIN providers p ON b.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE b.id = $1
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

    const result = await pool.query(query, [bookingId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    res.json({
      id: `bk${booking.id}`,
      customer: {
        name: booking.customer_name,
        phone: booking.customer_phone,
        email: booking.customer_email
      },
      provider: {
        name: booking.provider_name,
        phone: booking.provider_phone,
        email: booking.provider_email,
        location: {
          lat: parseFloat(booking.provider_lat),
          lng: parseFloat(booking.provider_lng)
        }
      },
      service: {
        name: booking.service_name,
        description: booking.service_description,
        icon: booking.service_icon
      },
      bookingDate: booking.booking_date,
      duration: parseFloat(booking.duration_hours),
      totalAmount: parseFloat(booking.total_amount),
      status: booking.status,
      paymentStatus: booking.payment_status,
      paymentId: booking.payment_id,
      customerAddress: booking.customer_address,
      customerLocation: {
        lat: parseFloat(booking.customer_lat),
        lng: parseFloat(booking.customer_lng)
      },
      specialInstructions: booking.special_instructions,
      trackingChannel: `socket://channel_bk${booking.id}`,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id.replace('bk', '');
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check authorization
    let authQuery;
    if (userRole === 'customer') {
      authQuery = 'SELECT id FROM bookings WHERE id = $1 AND customer_id = $2';
    } else if (userRole === 'provider') {
      const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      authQuery = 'SELECT id FROM bookings WHERE id = $1 AND provider_id = $2';
      userId = providerResult.rows[0].id;
    } else {
      authQuery = 'SELECT id FROM bookings WHERE id = $1';
    }

    const authResult = await pool.query(authQuery, userRole === 'admin' ? [bookingId] : [bookingId, userId]);
    if (authResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    // Update booking status
    await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, bookingId]);

    res.json({
      message: 'Booking status updated successfully',
      bookingId: `bk${bookingId}`,
      status
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id.replace('bk', '');
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if booking can be cancelled
    let authQuery;
    if (userRole === 'customer') {
      authQuery = `SELECT id, status FROM bookings WHERE id = $1 AND customer_id = $2`;
    } else if (userRole === 'provider') {
      const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      authQuery = `SELECT id, status FROM bookings WHERE id = $1 AND provider_id = $2`;
      userId = providerResult.rows[0].id;
    }

    const result = await pool.query(authQuery, [bookingId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }

    // Cancel booking
    await pool.query(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [bookingId]);

    res.json({
      message: 'Booking cancelled successfully',
      bookingId: `bk${bookingId}`
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;