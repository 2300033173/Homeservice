const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'housemate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const initializeDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100) DEFAULT 'Vijayawada',
        state VARCHAR(100) DEFAULT 'Andhra Pradesh',
        pincode VARCHAR(10),
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        base_price DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        experience_years INTEGER DEFAULT 0,
        hourly_rate DECIMAL(10,2),
        service_categories INTEGER[] DEFAULT '{}',
        location_lat DECIMAL(10,8),
        location_lng DECIMAL(11,8),
        radius_km INTEGER DEFAULT 10,
        rating DECIMAL(3,2) DEFAULT 0.0,
        total_reviews INTEGER DEFAULT 0,
        total_jobs INTEGER DEFAULT 0,
        kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
        kyc_documents JSONB,
        availability JSONB DEFAULT '{}',
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id),
        provider_id INTEGER REFERENCES providers(id),
        service_category_id INTEGER REFERENCES service_categories(id),
        booking_date TIMESTAMP NOT NULL,
        duration_hours DECIMAL(4,2) DEFAULT 1.0,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
        customer_address TEXT NOT NULL,
        customer_lat DECIMAL(10,8),
        customer_lng DECIMAL(11,8),
        special_instructions TEXT,
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        customer_id INTEGER REFERENCES users(id),
        provider_id INTEGER REFERENCES providers(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        photo_urls TEXT[],
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
        discount_amount DECIMAL(10,2),
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        max_uses INTEGER DEFAULT 1000,
        used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin user
    const adminExists = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('ADMIN', 10);
      
      await pool.query(`
        INSERT INTO users (email, password, role, name, phone, city, state, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, ['admin@housemate.in', hashedPassword, 'admin', 'HouseMate Admin', '+91-9876543210', 'Vijayawada', 'Andhra Pradesh', true, true]);
      
      console.log('✅ Admin user created: admin@housemate.in / ADMIN');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { pool, initializeDatabase };