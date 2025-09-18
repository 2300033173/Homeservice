const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Get provider profile
router.get('/profile', authenticateToken, authorizeRoles('provider'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT p.*, u.name, u.email, u.phone, u.address, u.city, u.state
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    
    const provider = result.rows[0];
    
    // Get service categories
    const categories = await pool.query(`
      SELECT id, name FROM service_categories 
      WHERE id = ANY($1)
    `, [provider.service_categories || []]);
    
    res.json({
      id: provider.id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      bio: provider.bio,
      experienceYears: provider.experience_years,
      hourlyRate: parseFloat(provider.hourly_rate || 0),
      serviceCategories: categories.rows,
      location: {
        lat: parseFloat(provider.location_lat || 0),
        lng: parseFloat(provider.location_lng || 0)
      },
      radiusKm: provider.radius_km,
      rating: parseFloat(provider.rating || 0),
      totalReviews: provider.total_reviews,
      totalJobs: provider.total_jobs,
      kycStatus: provider.kyc_status,
      kycDocuments: provider.kyc_documents,
      availability: provider.availability || {},
      isAvailable: provider.is_available,
      address: provider.address,
      city: provider.city,
      state: provider.state
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
});

// Update provider profile
router.put('/profile', authenticateToken, authorizeRoles('provider'), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bio,
      experienceYears,
      hourlyRate,
      serviceCategories,
      location,
      radiusKm,
      isAvailable
    } = req.body;
    
    await pool.query(`
      UPDATE providers SET
        bio = COALESCE($1, bio),
        experience_years = COALESCE($2, experience_years),
        hourly_rate = COALESCE($3, hourly_rate),
        service_categories = COALESCE($4, service_categories),
        location_lat = COALESCE($5, location_lat),
        location_lng = COALESCE($6, location_lng),
        radius_km = COALESCE($7, radius_km),
        is_available = COALESCE($8, is_available)
      WHERE user_id = $9
    `, [
      bio,
      experienceYears,
      hourlyRate,
      serviceCategories,
      location?.lat,
      location?.lng,
      radiusKm,
      isAvailable,
      userId
    ]);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload KYC documents
router.post('/kyc', authenticateToken, authorizeRoles('provider'), upload.fields([
  { name: 'docFront', maxCount: 1 },
  { name: 'docBack', maxCount: 1 },
  { name: 'additional', maxCount: 3 }
]), async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;
    
    if (!files.docFront || !files.docBack) {
      return res.status(400).json({ error: 'Front and back document images are required' });
    }
    
    const kycDocuments = {
      docFrontUrl: `/uploads/${files.docFront[0].filename}`,
      docBackUrl: `/uploads/${files.docBack[0].filename}`,
      additionalDocs: files.additional ? files.additional.map(file => `/uploads/${file.filename}`) : [],
      uploadedAt: new Date().toISOString()
    };
    
    await pool.query(`
      UPDATE providers SET
        kyc_documents = $1,
        kyc_status = 'pending'
      WHERE user_id = $2
    `, [JSON.stringify(kycDocuments), userId]);
    
    // Generate a mock background check ID
    const checkId = `bkch${Date.now()}`;
    
    res.json({
      kycStatus: 'pending',
      checkId,
      message: 'KYC documents uploaded successfully. Verification in progress.'
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({ error: 'Failed to upload KYC documents' });
  }
});

// Manage availability
router.put('/availability', authenticateToken, authorizeRoles('provider'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;
    
    // Validate availability format
    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({ error: 'Invalid availability format' });
    }
    
    await pool.query(`
      UPDATE providers SET
        availability = $1
      WHERE user_id = $2
    `, [JSON.stringify(availability), userId]);
    
    res.json({
      status: 'updated',
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get provider earnings
router.get('/earnings', authenticateToken, authorizeRoles('provider'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    // Get provider ID
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    
    const providerId = providerResult.rows[0].id;
    
    let query = `
      SELECT 
        DATE(b.created_at) as date,
        COUNT(*) as jobs_count,
        SUM(b.total_amount) as total_earnings,
        AVG(b.total_amount) as avg_job_value
      FROM bookings b
      WHERE b.provider_id = $1 
        AND b.status = 'completed'
        AND b.payment_status = 'paid'
    `;
    
    const params = [providerId];
    
    if (startDate) {
      query += ` AND b.created_at >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND b.created_at <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ` GROUP BY DATE(b.created_at) ORDER BY date DESC`;
    
    const result = await pool.query(query, params);
    
    // Calculate totals
    const totalEarnings = result.rows.reduce((sum, row) => sum + parseFloat(row.total_earnings), 0);
    const totalJobs = result.rows.reduce((sum, row) => sum + parseInt(row.jobs_count), 0);
    
    res.json({
      dailyEarnings: result.rows.map(row => ({
        date: row.date,
        jobsCount: parseInt(row.jobs_count),
        totalEarnings: parseFloat(row.total_earnings),
        avgJobValue: parseFloat(row.avg_job_value)
      })),
      summary: {
        totalEarnings,
        totalJobs,
        avgJobValue: totalJobs > 0 ? totalEarnings / totalJobs : 0
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings data' });
  }
});

// Get provider statistics
router.get('/stats', authenticateToken, authorizeRoles('provider'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get provider ID
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [userId]);
    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    
    const providerId = providerResult.rows[0].id;
    
    // Get various statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'completed' AND payment_status = 'paid' THEN total_amount ELSE 0 END) as total_earnings,
        AVG(CASE WHEN status = 'completed' THEN total_amount END) as avg_job_value
      FROM bookings
      WHERE provider_id = $1
    `, [providerId]);
    
    const reviewStats = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as four_plus_reviews
      FROM reviews
      WHERE provider_id = $1
    `, [providerId]);
    
    const bookingStats = stats.rows[0];
    const reviewData = reviewStats.rows[0];
    
    res.json({
      bookings: {
        pending: parseInt(bookingStats.pending_bookings),
        confirmed: parseInt(bookingStats.confirmed_bookings),
        active: parseInt(bookingStats.active_bookings),
        completed: parseInt(bookingStats.completed_bookings),
        cancelled: parseInt(bookingStats.cancelled_bookings)
      },
      earnings: {
        total: parseFloat(bookingStats.total_earnings || 0),
        avgJobValue: parseFloat(bookingStats.avg_job_value || 0)
      },
      reviews: {
        total: parseInt(reviewData.total_reviews),
        avgRating: parseFloat(reviewData.avg_rating || 0),
        fiveStarCount: parseInt(reviewData.five_star_reviews),
        fourPlusCount: parseInt(reviewData.four_plus_reviews)
      }
    });
  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ error: 'Failed to fetch provider statistics' });
  }
});

module.exports = router;