-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  services JSONB DEFAULT '[]',
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  provider_name VARCHAR(255) NOT NULL,
  provider_phone VARCHAR(20),
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  address TEXT NOT NULL,
  duration DECIMAL(3,1) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  instructions TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'en_route', 'in_progress', 'completed', 'cancelled')),
  customer_username VARCHAR(50),
  provider_username VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create provider_services table
CREATE TABLE provider_services (
  id SERIAL PRIMARY KEY,
  provider_username VARCHAR(50) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES ('ADMIN', 'ADMIN', 'admin');

-- Create indexes for better performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_provider ON bookings(provider_username);
CREATE INDEX idx_bookings_customer ON bookings(customer_username);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_provider_services_username ON provider_services(provider_username);