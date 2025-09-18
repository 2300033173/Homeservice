const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all service categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, base_price, icon_url, is_active
      FROM service_categories 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    res.json({
      categories: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch service categories' });
  }
});

// Get service providers with filters
router.post('/providers', async (req, res) => {
  try {
    const { location, category, date, radius = 10 } = req.body;
    
    let query = `
      SELECT 
        p.id,
        u.name,
        p.hourly_rate as rate,
        p.rating,
        u.phone,
        p.bio,
        p.experience_years,
        p.total_reviews,
        p.location_lat,
        p.location_lng,
        p.service_categories,
        p.is_available,
        u.address,
        CASE 
          WHEN $1::decimal IS NOT NULL AND $2::decimal IS NOT NULL THEN
            (6371 * acos(cos(radians($1)) * cos(radians(p.location_lat)) * 
            cos(radians(p.location_lng) - radians($2)) + sin(radians($1)) * 
            sin(radians(p.location_lat))))
          ELSE 0
        END as distance
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.kyc_status = 'approved' 
        AND p.is_available = true 
        AND u.is_active = true
    `;
    
    const params = [location?.lat, location?.lng];
    let paramIndex = 2;
    
    // Filter by category if provided
    if (category) {
      const categoryResult = await pool.query('SELECT id FROM service_categories WHERE name ILIKE $1', [`%${category}%`]);
      if (categoryResult.rows.length > 0) {
        query += ` AND $${++paramIndex} = ANY(p.service_categories)`;
        params.push(categoryResult.rows[0].id);
      }
    }
    
    // Filter by distance if location provided
    if (location?.lat && location?.lng) {
      query += ` HAVING distance <= $${++paramIndex}`;
      params.push(radius);
    }
    
    query += ` ORDER BY p.rating DESC, p.total_reviews DESC LIMIT 20`;
    
    const result = await pool.query(query, params);
    
    // Get service category names for each provider
    const providers = await Promise.all(result.rows.map(async (provider) => {
      const categoryNames = await pool.query(`
        SELECT name FROM service_categories 
        WHERE id = ANY($1)
      `, [provider.service_categories]);
      
      return {
        id: `prov${provider.id}`,
        name: provider.name,
        rate: parseFloat(provider.rate),
        rating: parseFloat(provider.rating),
        phone: provider.phone,
        bio: provider.bio,
        experienceYears: provider.experience_years,
        totalReviews: provider.total_reviews,
        location: {
          lat: parseFloat(provider.location_lat),
          lng: parseFloat(provider.location_lng)
        },
        address: provider.address,
        services: categoryNames.rows.map(cat => cat.name),
        verified: true,
        available: provider.is_available,
        distance: location?.lat ? parseFloat(provider.distance).toFixed(2) : null,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563EB&color=fff`,
        nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      };
    }));
    
    res.json({
      providers,
      total: providers.length,
      location: location || { city: 'Vijayawada', state: 'Andhra Pradesh' }
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to fetch service providers' });
  }
});

// Get provider details
router.get('/providers/:id', async (req, res) => {
  try {
    const providerId = req.params.id.replace('prov', '');
    
    const result = await pool.query(`
      SELECT 
        p.*,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.state
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.kyc_status = 'approved'
    `, [providerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const provider = result.rows[0];
    
    // Get service categories
    const categories = await pool.query(`
      SELECT name FROM service_categories 
      WHERE id = ANY($1)
    `, [provider.service_categories]);
    
    // Get recent reviews
    const reviews = await pool.query(`
      SELECT 
        r.rating,
        r.review_text,
        r.created_at,
        u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [providerId]);
    
    res.json({
      id: `prov${provider.id}`,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      bio: provider.bio,
      experienceYears: provider.experience_years,
      hourlyRate: parseFloat(provider.hourly_rate),
      rating: parseFloat(provider.rating),
      totalReviews: provider.total_reviews,
      totalJobs: provider.total_jobs,
      location: {
        lat: parseFloat(provider.location_lat),
        lng: parseFloat(provider.location_lng)
      },
      address: provider.address,
      city: provider.city,
      state: provider.state,
      services: categories.rows.map(cat => cat.name),
      availability: provider.availability || {},
      isAvailable: provider.is_available,
      kycStatus: provider.kyc_status,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563EB&color=fff`,
      reviews: reviews.rows.map(review => ({
        rating: review.rating,
        text: review.review_text,
        date: review.created_at,
        customerName: review.customer_name
      }))
    });
  } catch (error) {
    console.error('Get provider details error:', error);
    res.status(500).json({ error: 'Failed to fetch provider details' });
  }
});

// Search services
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng, radius = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Search in service categories and provider names
    let query = `
      SELECT DISTINCT
        p.id,
        u.name,
        p.hourly_rate as rate,
        p.rating,
        p.total_reviews,
        p.location_lat,
        p.location_lng,
        u.address,
        sc.name as service_name
      FROM providers p
      JOIN users u ON p.user_id = u.id
      JOIN service_categories sc ON sc.id = ANY(p.service_categories)
      WHERE p.kyc_status = 'approved' 
        AND p.is_available = true 
        AND u.is_active = true
        AND (
          u.name ILIKE $1 
          OR sc.name ILIKE $1 
          OR sc.description ILIKE $1
          OR p.bio ILIKE $1
        )
    `;
    
    const searchTerm = `%${q}%`;
    const params = [searchTerm];
    
    // Add location filter if provided
    if (lat && lng) {
      query += ` AND (6371 * acos(cos(radians($2)) * cos(radians(p.location_lat)) * 
                cos(radians(p.location_lng) - radians($3)) + sin(radians($2)) * 
                sin(radians(p.location_lat)))) <= $4`;
      params.push(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    }
    
    query += ` ORDER BY p.rating DESC, p.total_reviews DESC LIMIT 20`;
    
    const result = await pool.query(query, params);
    
    const providers = result.rows.map(provider => ({
      id: `prov${provider.id}`,
      name: provider.name,
      rate: parseFloat(provider.rate),
      rating: parseFloat(provider.rating),
      totalReviews: provider.total_reviews,
      location: {
        lat: parseFloat(provider.location_lat),
        lng: parseFloat(provider.location_lng)
      },
      address: provider.address,
      serviceName: provider.service_name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563EB&color=fff`
    }));
    
    res.json({
      query: q,
      providers,
      total: providers.length
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;