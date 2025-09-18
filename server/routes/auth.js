const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['customer', 'provider']),
  body('phone').optional().isMobilePhone('en-IN')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, phone, address, pincode } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (email, password, name, role, phone, address, pincode, city, state)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, name, role, city, state
    `, [email, hashedPassword, name, role, phone, address, pincode, 'Vijayawada', 'Andhra Pradesh']);

    const user = result.rows[0];

    // If provider, create provider profile
    if (role === 'provider') {
      await pool.query(`
        INSERT INTO providers (user_id, bio, hourly_rate, location_lat, location_lng)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, `Professional ${name} serving Vijayawada`, 500, 16.5062, 80.6480]);
    }

    const tokens = generateTokens(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.city,
        state: user.state
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  body('role').isIn(['customer', 'provider', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Special handling for admin login
    if (role === 'admin') {
      if ((email === 'admin@housemate.in' || email === 'ADMIN') && 
          (password === 'ADMIN')) {
        // Get or create admin user
        let adminUser = await pool.query('SELECT * FROM users WHERE role = $1 LIMIT 1', ['admin']);
        
        if (adminUser.rows.length === 0) {
          // Create admin user if doesn't exist
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash('ADMIN', 10);
          
          const newAdmin = await pool.query(`
            INSERT INTO users (email, password, role, name, phone, city, state, is_verified, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `, ['admin@housemate.in', hashedPassword, 'admin', 'HouseMate Admin', '+91-9876543210', 'Vijayawada', 'Andhra Pradesh', true, true]);
          
          adminUser = newAdmin;
        }
        
        const user = adminUser.rows[0];
        const tokens = generateTokens(user.id, user.role);
        return res.json({
          message: 'Admin login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            city: user.city,
            state: user.state
          },
          ...tokens
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials. Use ADMIN/ADMIN' });
    }

    // Regular user login
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2 AND is_active = true', [email, role]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.city,
        state: user.state,
        isVerified: user.is_verified
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId, decoded.role);

    res.json(tokens);
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let additionalData = {};

    if (user.role === 'provider') {
      const provider = await pool.query('SELECT * FROM providers WHERE user_id = $1', [user.id]);
      if (provider.rows.length > 0) {
        additionalData.provider = provider.rows[0];
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isVerified: user.is_verified
      },
      ...additionalData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;