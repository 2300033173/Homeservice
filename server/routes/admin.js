const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get overall statistics
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND is_active = true) as total_customers,
        (SELECT COUNT(*) FROM providers WHERE kyc_status = 'approved') as active_providers,
        (SELECT COUNT(*) FROM providers WHERE kyc_status = 'pending') as pending_providers,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE status = 'completed' AND payment_status = 'paid') as total_revenue,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT AVG(rating) FROM reviews) as avg_rating
    `);
    
    // Get recent bookings
    const recentBookings = await pool.query(`
      SELECT 
        b.id,
        b.status,
        b.total_amount,
        b.created_at,
        cu.name as customer_name,
        pu.name as provider_name,
        sc.name as service_name
      FROM bookings b
      JOIN users cu ON b.customer_id = cu.id
      JOIN providers p ON b.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);
    
    // Get monthly revenue data
    const monthlyRevenue = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE status = 'completed' AND payment_status = 'paid'
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);
    
    const dashboardStats = stats.rows[0];
    
    res.json({
      overview: {
        totalCustomers: parseInt(dashboardStats.total_customers),
        activeProviders: parseInt(dashboardStats.active_providers),
        pendingProviders: parseInt(dashboardStats.pending_providers),
        totalBookings: parseInt(dashboardStats.total_bookings),
        completedBookings: parseInt(dashboardStats.completed_bookings),
        totalRevenue: parseFloat(dashboardStats.total_revenue || 0),
        totalReviews: parseInt(dashboardStats.total_reviews),
        avgRating: parseFloat(dashboardStats.avg_rating || 0)
      },
      recentBookings: recentBookings.rows.map(booking => ({
        id: `bk${booking.id}`,
        customerName: booking.customer_name,
        providerName: booking.provider_name,
        serviceName: booking.service_name,
        amount: parseFloat(booking.total_amount),
        status: booking.status,
        createdAt: booking.created_at
      })),
      monthlyRevenue: monthlyRevenue.rows.map(item => ({
        month: item.month,
        revenue: parseFloat(item.revenue),
        bookingsCount: parseInt(item.bookings_count)
      }))
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all bookings with filters
router.get('/bookings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { dateFrom, dateTo, status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        b.*,
        cu.name as customer_name,
        cu.phone as customer_phone,
        pu.name as provider_name,
        pu.phone as provider_phone,
        sc.name as service_name
      FROM bookings b
      JOIN users cu ON b.customer_id = cu.id
      JOIN providers p ON b.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (dateFrom) {
      query += ` AND b.created_at >= $${params.length + 1}`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND b.created_at <= $${params.length + 1}`;
      params.push(dateTo);
    }
    
    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    const bookings = result.rows.map(booking => ({
      bookingId: `bk${booking.id}`,
      customerName: booking.customer_name,
      customerPhone: booking.customer_phone,
      providerName: booking.provider_name,
      providerPhone: booking.provider_phone,
      serviceName: booking.service_name,
      bookingDate: booking.booking_date,
      amount: parseFloat(booking.total_amount),
      status: booking.status,
      paymentStatus: booking.payment_status,
      customerAddress: booking.customer_address,
      createdAt: booking.created_at
    }));
    
    res.json({
      bookings,
      total: bookings.length,
      hasMore: bookings.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all providers for management
router.get('/providers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { kycStatus, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        p.*,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.is_active,
        u.created_at as user_created_at
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (kycStatus) {
      query += ` AND p.kyc_status = $${params.length + 1}`;
      params.push(kycStatus);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get service categories for each provider
    const providers = await Promise.all(result.rows.map(async (provider) => {
      const categories = await pool.query(`
        SELECT name FROM service_categories 
        WHERE id = ANY($1)
      `, [provider.service_categories || []]);
      
      return {
        id: `prov${provider.id}`,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        bio: provider.bio,
        experienceYears: provider.experience_years,
        hourlyRate: parseFloat(provider.hourly_rate || 0),
        rating: parseFloat(provider.rating || 0),
        totalReviews: provider.total_reviews,
        totalJobs: provider.total_jobs,
        kycStatus: provider.kyc_status,
        kycDocuments: provider.kyc_documents,
        serviceCategories: categories.rows.map(cat => cat.name),
        location: {
          lat: parseFloat(provider.location_lat || 0),
          lng: parseFloat(provider.location_lng || 0)
        },
        isAvailable: provider.is_available,
        isActive: provider.is_active,
        address: provider.address,
        createdAt: provider.user_created_at
      };
    }));
    
    res.json({
      providers,
      total: providers.length,
      hasMore: providers.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get admin providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Approve/Reject provider KYC
router.patch('/providers/:id/kyc', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const providerId = req.params.id.replace('prov', '');
    const { status, reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    
    await pool.query(`
      UPDATE providers 
      SET kyc_status = $1
      WHERE id = $2
    `, [status, providerId]);
    
    res.json({
      message: `Provider KYC ${status} successfully`,
      providerId: `prov${providerId}`,
      status,
      reason
    });
  } catch (error) {
    console.error('Update provider KYC error:', error);
    res.status(500).json({ error: 'Failed to update provider KYC status' });
  }
});

// Deactivate/Activate provider
router.patch('/providers/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const providerId = req.params.id.replace('prov', '');
    const { isActive } = req.body;
    
    // Get user ID for the provider
    const provider = await pool.query('SELECT user_id FROM providers WHERE id = $1', [providerId]);
    if (provider.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const userId = provider.rows[0].user_id;
    
    await pool.query(`
      UPDATE users 
      SET is_active = $1
      WHERE id = $2
    `, [isActive, userId]);
    
    res.json({
      message: `Provider ${isActive ? 'activated' : 'deactivated'} successfully`,
      providerId: `prov${providerId}`,
      isActive
    });
  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(500).json({ error: 'Failed to update provider status' });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Revenue by day
    let revenueQuery = `
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE status = 'completed' AND payment_status = 'paid'
    `;
    
    const params = [];
    
    if (startDate) {
      revenueQuery += ` AND created_at >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      revenueQuery += ` AND created_at <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    revenueQuery += ` GROUP BY DATE(created_at) ORDER BY date`;
    
    const revenueResult = await pool.query(revenueQuery, params);
    
    // Jobs heatmap (location-based)
    const heatmapResult = await pool.query(`
      SELECT 
        customer_lat as lat,
        customer_lng as lng,
        COUNT(*) as count
      FROM bookings
      WHERE customer_lat IS NOT NULL AND customer_lng IS NOT NULL
        AND status = 'completed'
      GROUP BY customer_lat, customer_lng
      HAVING COUNT(*) > 0
      ORDER BY count DESC
      LIMIT 100
    `);
    
    // Service category popularity
    const categoryStats = await pool.query(`
      SELECT 
        sc.name,
        COUNT(*) as bookings_count,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value
      FROM bookings b
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE b.status = 'completed'
      GROUP BY sc.name
      ORDER BY bookings_count DESC
    `);
    
    res.json({
      revenueByDay: revenueResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        bookingsCount: parseInt(row.bookings_count)
      })),
      jobsHeatmap: heatmapResult.rows.map(row => ({
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        count: parseInt(row.count)
      })),
      categoryStats: categoryStats.rows.map(row => ({
        name: row.name,
        bookingsCount: parseInt(row.bookings_count),
        totalRevenue: parseFloat(row.total_revenue),
        avgBookingValue: parseFloat(row.avg_booking_value)
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Manage promo codes
router.post('/promo-codes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { action, code, discountPercent, discountAmount, minOrderAmount, maxUses, expiresAt } = req.body;
    
    if (action === 'create') {
      const result = await pool.query(`
        INSERT INTO promo_codes (code, discount_percent, discount_amount, min_order_amount, max_uses, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [code, discountPercent, discountAmount, minOrderAmount, maxUses, expiresAt]);
      
      const promoId = result.rows[0].id;
      
      res.status(201).json({
        promoId: `promo${promoId}`,
        code,
        status: 'active',
        message: 'Promo code created successfully'
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Manage promo codes error:', error);
    res.status(500).json({ error: 'Failed to manage promo code' });
  }
});

// Get all promo codes
router.get('/promo-codes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM promo_codes
      ORDER BY created_at DESC
    `);
    
    const promoCodes = result.rows.map(promo => ({
      id: `promo${promo.id}`,
      code: promo.code,
      discountPercent: promo.discount_percent,
      discountAmount: parseFloat(promo.discount_amount || 0),
      minOrderAmount: parseFloat(promo.min_order_amount || 0),
      maxUses: promo.max_uses,
      usedCount: promo.used_count,
      expiresAt: promo.expires_at,
      isActive: promo.is_active,
      createdAt: promo.created_at
    }));
    
    res.json({
      promoCodes,
      total: promoCodes.length
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Toggle promo code status
router.patch('/promo-codes/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const promoId = req.params.id.replace('promo', '');
    const { isActive } = req.body;
    
    await pool.query(`
      UPDATE promo_codes 
      SET is_active = $1
      WHERE id = $2
    `, [isActive, promoId]);
    
    res.json({
      message: `Promo code ${isActive ? 'activated' : 'deactivated'} successfully`,
      promoId: `promo${promoId}`,
      isActive
    });
  } catch (error) {
    console.error('Toggle promo code error:', error);
    res.status(500).json({ error: 'Failed to update promo code status' });
  }
});

module.exports = router;