const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Configure multer for review photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Submit review
router.post('/', authenticateToken, authorizeRoles('customer'), upload.array('photos', 5), async (req, res) => {
  try {
    const { bookingId, rating, reviewText } = req.body;
    const customerId = req.user.id;
    const files = req.files || [];
    
    const bookingIdNum = bookingId.replace('bk', '');
    
    // Verify booking belongs to customer and is completed
    const booking = await pool.query(`
      SELECT b.id, b.provider_id, b.status
      FROM bookings b
      WHERE b.id = $1 AND b.customer_id = $2 AND b.status = 'completed'
    `, [bookingIdNum, customerId]);
    
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Completed booking not found' });
    }
    
    const bookingData = booking.rows[0];
    
    // Check if review already exists
    const existingReview = await pool.query(`
      SELECT id FROM reviews WHERE booking_id = $1
    `, [bookingIdNum]);
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Review already submitted for this booking' });
    }
    
    // Validate rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Process uploaded photos
    const photoUrls = files.map(file => `/uploads/reviews/${file.filename}`);
    
    // Insert review
    const reviewResult = await pool.query(`
      INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text, photo_urls, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [bookingIdNum, customerId, bookingData.provider_id, ratingNum, reviewText, photoUrls, true]);
    
    const reviewId = reviewResult.rows[0].id;
    
    // Update provider rating
    const ratingStats = await pool.query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE provider_id = $1
    `, [bookingData.provider_id]);
    
    const stats = ratingStats.rows[0];
    await pool.query(`
      UPDATE providers 
      SET rating = $1, total_reviews = $2
      WHERE id = $3
    `, [parseFloat(stats.avg_rating), parseInt(stats.total_reviews), bookingData.provider_id]);
    
    res.status(201).json({
      reviewId: `rev${reviewId}`,
      status: 'stored',
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get reviews for a provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const providerId = req.params.providerId.replace('prov', '');
    const { limit = 10, offset = 0, rating } = req.query;
    
    let query = `
      SELECT 
        r.*,
        u.name as customer_name,
        sc.name as service_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE r.provider_id = $1
    `;
    
    const params = [providerId];
    
    // Filter by rating if provided
    if (rating) {
      query += ` AND r.rating = $${params.length + 1}`;
      params.push(parseInt(rating));
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get rating distribution
    const ratingDist = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE provider_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [providerId]);
    
    const reviews = result.rows.map(review => ({
      id: `rev${review.id}`,
      rating: review.rating,
      reviewText: review.review_text,
      photoUrls: review.photo_urls || [],
      customerName: review.customer_name,
      serviceName: review.service_name,
      isVerified: review.is_verified,
      createdAt: review.created_at
    }));
    
    const ratingDistribution = {};
    ratingDist.rows.forEach(item => {
      ratingDistribution[item.rating] = parseInt(item.count);
    });
    
    res.json({
      reviews,
      total: reviews.length,
      hasMore: reviews.length === parseInt(limit),
      ratingDistribution
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get customer's reviews
router.get('/my-reviews', authenticateToken, authorizeRoles('customer'), async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        r.*,
        pu.name as provider_name,
        sc.name as service_name,
        b.booking_date
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN providers p ON r.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE r.customer_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [customerId, limit, offset]);
    
    const reviews = result.rows.map(review => ({
      id: `rev${review.id}`,
      bookingId: `bk${review.booking_id}`,
      rating: review.rating,
      reviewText: review.review_text,
      photoUrls: review.photo_urls || [],
      providerName: review.provider_name,
      serviceName: review.service_name,
      bookingDate: review.booking_date,
      createdAt: review.created_at
    }));
    
    res.json({
      reviews,
      total: reviews.length,
      hasMore: reviews.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch customer reviews' });
  }
});

// Get review details
router.get('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id.replace('rev', '');
    
    const result = await pool.query(`
      SELECT 
        r.*,
        cu.name as customer_name,
        pu.name as provider_name,
        sc.name as service_name,
        b.booking_date,
        b.total_amount
      FROM reviews r
      JOIN users cu ON r.customer_id = cu.id
      JOIN providers p ON r.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE r.id = $1
    `, [reviewId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = result.rows[0];
    
    res.json({
      id: `rev${review.id}`,
      bookingId: `bk${review.booking_id}`,
      rating: review.rating,
      reviewText: review.review_text,
      photoUrls: review.photo_urls || [],
      customerName: review.customer_name,
      providerName: review.provider_name,
      serviceName: review.service_name,
      bookingDate: review.booking_date,
      bookingAmount: parseFloat(review.total_amount),
      isVerified: review.is_verified,
      createdAt: review.created_at
    });
  } catch (error) {
    console.error('Get review details error:', error);
    res.status(500).json({ error: 'Failed to fetch review details' });
  }
});

// Update review (only by customer who wrote it)
router.put('/:id', authenticateToken, authorizeRoles('customer'), upload.array('photos', 5), async (req, res) => {
  try {
    const reviewId = req.params.id.replace('rev', '');
    const customerId = req.user.id;
    const { rating, reviewText } = req.body;
    const files = req.files || [];
    
    // Verify review belongs to customer
    const existingReview = await pool.query(`
      SELECT id, photo_urls FROM reviews WHERE id = $1 AND customer_id = $2
    `, [reviewId, customerId]);
    
    if (existingReview.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Validate rating if provided
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
    }
    
    // Process new photos
    const newPhotoUrls = files.map(file => `/uploads/reviews/${file.filename}`);
    const existingPhotoUrls = existingReview.rows[0].photo_urls || [];
    const allPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];
    
    // Update review
    await pool.query(`
      UPDATE reviews SET
        rating = COALESCE($1, rating),
        review_text = COALESCE($2, review_text),
        photo_urls = $3
      WHERE id = $4
    `, [rating ? parseInt(rating) : null, reviewText, allPhotoUrls, reviewId]);
    
    res.json({
      message: 'Review updated successfully',
      reviewId: `rev${reviewId}`
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (only by customer who wrote it)
router.delete('/:id', authenticateToken, authorizeRoles('customer'), async (req, res) => {
  try {
    const reviewId = req.params.id.replace('rev', '');
    const customerId = req.user.id;
    
    // Verify review belongs to customer
    const review = await pool.query(`
      SELECT id, provider_id FROM reviews WHERE id = $1 AND customer_id = $2
    `, [reviewId, customerId]);
    
    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const providerId = review.rows[0].provider_id;
    
    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    
    // Update provider rating
    const ratingStats = await pool.query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE provider_id = $1
    `, [providerId]);
    
    const stats = ratingStats.rows[0];
    await pool.query(`
      UPDATE providers 
      SET rating = $1, total_reviews = $2
      WHERE id = $3
    `, [
      stats.total_reviews > 0 ? parseFloat(stats.avg_rating) : 0,
      parseInt(stats.total_reviews),
      providerId
    ]);
    
    res.json({
      message: 'Review deleted successfully',
      reviewId: `rev${reviewId}`
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;