-- HouseMate Complete Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
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
CREATE TABLE IF NOT EXISTS provider_services (
  id SERIAL PRIMARY KEY,
  provider_username VARCHAR(50) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  experience INTEGER NOT NULL,
  phone VARCHAR(20) NOT NULL,
  area VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES ('ADMIN', 'ADMIN', 'admin') ON CONFLICT (username) DO NOTHING;

-- Insert sample providers
INSERT INTO users (username, password, role) VALUES 
('provider1', 'provider1', 'provider'),
('provider2', 'provider2', 'provider'),
('provider3', 'provider3', 'provider'),
('provider4', 'provider4', 'provider'),
('provider5', 'provider5', 'provider'),
('provider6', 'provider6', 'provider'),
('provider7', 'provider7', 'provider'),
('provider8', 'provider8', 'provider')
ON CONFLICT (username) DO NOTHING;

-- Insert comprehensive home services for Vijayawada (100+ services)
INSERT INTO provider_services (provider_username, service_name, price, description, experience, phone, area, is_active) VALUES

-- Home Cleaning Services (15 services)
('provider1', 'Home Deep Cleaning', 800, 'Complete deep cleaning of entire house including kitchen, bathrooms, bedrooms', 5, '9951779512', 'Benz Circle', true),
('provider2', 'Regular House Cleaning', 400, 'Daily/weekly house cleaning service with dusting, mopping, sweeping', 3, '8739089387', 'Patamata', true),
('provider3', 'Kitchen Deep Cleaning', 600, 'Deep cleaning of kitchen including chimney, gas stove, cabinets', 4, '9848123456', 'Governorpet', true),
('provider4', 'Bathroom Cleaning', 300, 'Complete bathroom sanitization and deep cleaning', 6, '9963258741', 'Labbipet', true),
('provider5', 'Sofa & Carpet Cleaning', 500, 'Professional sofa and carpet cleaning with steam cleaning', 2, '9876543210', 'Auto Nagar', true),
('provider6', 'Window Cleaning', 250, 'Professional window and glass cleaning service', 3, '9123456789', 'Krishnalanka', true),
('provider7', 'Floor Deep Cleaning', 450, 'Marble, tile, and wooden floor deep cleaning', 4, '8765432109', 'Bhavanipuram', true),
('provider8', 'Balcony Cleaning', 200, 'Balcony and terrace cleaning service', 2, '7654321098', 'Suryaraopet', true),
('provider1', 'Post Construction Cleaning', 1200, 'Complete cleaning after construction or renovation', 8, '9951779512', 'Benz Circle', true),
('provider2', 'Office Cleaning', 600, 'Commercial office space cleaning service', 5, '8739089387', 'Patamata', true),
('provider3', 'Move-in/Move-out Cleaning', 900, 'Complete cleaning for moving in or out', 6, '9848123456', 'Governorpet', true),
('provider4', 'Mattress Cleaning', 400, 'Professional mattress deep cleaning and sanitization', 3, '9963258741', 'Labbipet', true),
('provider5', 'Curtain Cleaning', 350, 'Curtain and blind cleaning service', 4, '9876543210', 'Auto Nagar', true),
('provider6', 'Upholstery Cleaning', 550, 'Furniture upholstery cleaning service', 5, '9123456789', 'Krishnalanka', true),
('provider7', 'Chimney Cleaning', 800, 'Kitchen chimney deep cleaning service', 7, '8765432109', 'Bhavanipuram', true),

-- Plumbing Services (20 services)
('provider1', 'Plumbing Repairs', 600, 'All types of plumbing repairs, pipe fixing, leak repairs', 8, '9908495083', 'Penamaluru', true),
('provider2', 'Bathroom Plumbing', 800, 'Complete bathroom plumbing installation and repairs', 6, '9954598770', 'Teachers Colony', true),
('provider3', 'Kitchen Plumbing', 700, 'Kitchen sink, dishwasher, water purifier plumbing', 7, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Water Tank Cleaning', 400, 'Overhead and underground water tank cleaning service', 10, '7382525663', 'Auto Nagar', true),
('provider5', 'Drain Cleaning', 350, 'Blocked drain cleaning and maintenance', 5, '9866123456', 'Benz Circle', true),
('provider6', 'Pipe Installation', 500, 'New water pipe installation and replacement', 6, '9123456789', 'Krishnalanka', true),
('provider7', 'Toilet Installation', 600, 'Toilet seat and commode installation', 4, '8765432109', 'Bhavanipuram', true),
('provider8', 'Tap Repair', 200, 'Tap and faucet repair service', 3, '7654321098', 'Suryaraopet', true),
('provider1', 'Water Heater Installation', 800, 'Geyser and water heater installation', 8, '9908495083', 'Penamaluru', true),
('provider2', 'Sewage Cleaning', 600, 'Sewage line cleaning and maintenance', 10, '9954598770', 'Teachers Colony', true),
('provider3', 'Bore Well Cleaning', 1000, 'Bore well cleaning and maintenance', 12, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Water Pump Repair', 500, 'Water motor and pump repair service', 7, '7382525663', 'Auto Nagar', true),
('provider5', 'Bathroom Fitting', 700, 'Complete bathroom fittings installation', 5, '9866123456', 'Benz Circle', true),
('provider6', 'Kitchen Sink Installation', 400, 'Kitchen sink and basin installation', 4, '9123456789', 'Krishnalanka', true),
('provider7', 'Water Filter Installation', 300, 'RO and water filter installation service', 3, '8765432109', 'Bhavanipuram', true),
('provider8', 'Plumbing Inspection', 250, 'Complete plumbing system inspection', 8, '7654321098', 'Suryaraopet', true),
('provider1', 'Emergency Plumbing', 800, '24/7 emergency plumbing service', 10, '9908495083', 'Penamaluru', true),
('provider2', 'Shower Installation', 450, 'Shower head and system installation', 5, '9954598770', 'Teachers Colony', true),
('provider3', 'Pipe Leak Detection', 600, 'Advanced leak detection service', 9, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Sump Tank Cleaning', 500, 'Underground sump tank cleaning', 6, '7382525663', 'Auto Nagar', true),

-- Electrical Services (20 services)
('provider1', 'Electrical Repairs', 550, 'All electrical repairs, wiring, switch installation', 8, '9908495083', 'Penamaluru', true),
('provider2', 'Fan Installation', 300, 'Ceiling fan installation and repair service', 6, '9954598770', 'Teachers Colony', true),
('provider3', 'Light Fitting', 250, 'LED lights, tube lights, decorative lighting installation', 7, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Electrical Wiring', 800, 'Complete house wiring and rewiring services', 12, '9876543210', 'Bhavanipuram', true),
('provider5', 'Switch & Socket Repair', 200, 'Switch board repair and socket installation', 5, '8885432109', 'Krishnalanka', true),
('provider6', 'Inverter Installation', 1200, 'Home inverter and UPS installation', 8, '9123456789', 'Krishnalanka', true),
('provider7', 'Electrical Panel Upgrade', 1500, 'Main electrical panel upgrade and installation', 10, '8765432109', 'Bhavanipuram', true),
('provider8', 'Chandelier Installation', 600, 'Decorative chandelier and pendant light installation', 5, '7654321098', 'Suryaraopet', true),
('provider1', 'Emergency Electrical', 800, '24/7 emergency electrical service', 12, '9908495083', 'Penamaluru', true),
('provider2', 'Smart Home Setup', 2000, 'Smart switches and home automation setup', 6, '9954598770', 'Teachers Colony', true),
('provider3', 'Generator Installation', 1800, 'Home generator installation and maintenance', 9, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Solar Panel Installation', 3000, 'Residential solar panel installation', 8, '9876543210', 'Bhavanipuram', true),
('provider5', 'Electrical Safety Inspection', 400, 'Complete electrical safety audit', 10, '8885432109', 'Krishnalanka', true),
('provider6', 'Outdoor Lighting', 700, 'Garden and outdoor lighting installation', 5, '9123456789', 'Krishnalanka', true),
('provider7', 'Electrical Appliance Repair', 450, 'Small electrical appliance repair', 7, '8765432109', 'Bhavanipuram', true),
('provider8', 'Cable Management', 300, 'Electrical cable organization and management', 4, '7654321098', 'Suryaraopet', true),
('provider1', 'Doorbell Installation', 200, 'Wired and wireless doorbell installation', 3, '9908495083', 'Penamaluru', true),
('provider2', 'Exhaust Fan Installation', 350, 'Bathroom and kitchen exhaust fan installation', 5, '9954598770', 'Teachers Colony', true),
('provider3', 'Electrical Meter Reading', 150, 'Electrical consumption audit and meter reading', 6, '9849876543', 'Guru Nanak Colony', true),
('provider4', 'Power Backup Solutions', 1600, 'Complete power backup system installation', 9, '9876543210', 'Bhavanipuram', true),

-- AC Services (15 services)
('provider1', 'AC Installation', 1200, 'Split and window AC installation service', 8, '9848890123', 'Benz Circle', true),
('provider2', 'AC Repair', 800, 'AC repair, gas filling, compressor repair', 6, '9963012345', 'Patamata', true),
('provider3', 'AC Servicing', 500, 'Regular AC maintenance and cleaning service', 10, '8885123456', 'Governorpet', true),
('provider4', 'AC Gas Filling', 600, 'AC gas refilling and pressure checking', 5, '9912456789', 'Labbipet', true),
('provider5', 'AC Deep Cleaning', 700, 'Complete AC deep cleaning and sanitization', 4, '9704567890', 'Krishnalanka', true),
('provider6', 'Central AC Installation', 2500, 'Central air conditioning system installation', 12, '9123456789', 'Krishnalanka', true),
('provider7', 'AC Duct Cleaning', 800, 'AC duct cleaning and maintenance', 7, '8765432109', 'Bhavanipuram', true),
('provider8', 'AC Remote Repair', 150, 'AC remote control repair and replacement', 3, '7654321098', 'Suryaraopet', true),
('provider1', 'AC Uninstallation', 400, 'Safe AC removal and uninstallation', 6, '9848890123', 'Benz Circle', true),
('provider2', 'AC Thermostat Repair', 300, 'AC thermostat repair and calibration', 5, '9963012345', 'Patamata', true),
('provider3', 'AC Coil Cleaning', 600, 'Evaporator and condenser coil cleaning', 8, '8885123456', 'Governorpet', true),
('provider4', 'AC Filter Replacement', 200, 'AC air filter replacement service', 4, '9912456789', 'Labbipet', true),
('provider5', 'AC Compressor Repair', 1500, 'AC compressor repair and replacement', 10, '9704567890', 'Krishnalanka', true),
('provider6', 'AC Electrical Repair', 500, 'AC electrical component repair', 7, '9123456789', 'Krishnalanka', true),
('provider7', 'AC Performance Optimization', 400, 'AC efficiency improvement service', 6, '8765432109', 'Bhavanipuram', true),

-- Painting Services (12 services)
('provider1', 'House Painting', 450, 'Interior and exterior house painting service', 5, '9848567890', 'Patamata', true),
('provider2', 'Wall Painting', 350, 'Single room wall painting and touch-up', 8, '9963789012', 'Governorpet', true),
('provider3', 'Texture Painting', 600, 'Decorative texture and design painting', 4, '8885678901', 'Labbipet', true),
('provider4', 'Waterproofing', 800, 'Roof and wall waterproofing service', 6, '9912890123', 'Benz Circle', true),
('provider5', 'Wood Polishing', 400, 'Furniture wood polishing and varnishing', 3, '9704901234', 'Krishnalanka', true),
('provider6', 'Ceiling Painting', 300, 'Ceiling painting and repair service', 5, '9123456789', 'Krishnalanka', true),
('provider7', 'Exterior Wall Painting', 500, 'Building exterior wall painting', 7, '8765432109', 'Bhavanipuram', true),
('provider8', 'Stencil Painting', 250, 'Decorative stencil and pattern painting', 4, '7654321098', 'Suryaraopet', true),
('provider1', 'Primer Application', 200, 'Wall primer and base coat application', 6, '9848567890', 'Patamata', true),
('provider2', 'Paint Consultation', 150, 'Color consultation and paint selection', 10, '9963789012', 'Governorpet', true),
('provider3', 'Spray Painting', 700, 'Professional spray painting service', 8, '8885678901', 'Labbipet', true),
('provider4', 'Anti-Rust Treatment', 350, 'Metal surface anti-rust treatment and painting', 5, '9912890123', 'Benz Circle', true),

-- Home Security Services (10 services)
('provider1', 'CCTV Installation', 1500, 'Security camera installation and setup', 7, '9866234567', 'Auto Nagar', true),
('provider2', 'Door Lock Repair', 300, 'Digital and manual door lock installation', 5, '9848789012', 'Benz Circle', true),
('provider3', 'Intercom Installation', 800, 'Video door phone installation service', 4, '9963901234', 'Patamata', true),
('provider4', 'Security System Setup', 2000, 'Complete home security system installation', 8, '8885890123', 'Governorpet', true),
('provider5', 'Safe Installation', 1000, 'Home safe installation and setup', 6, '9912234567', 'Labbipet', true),
('provider6', 'Alarm System Installation', 1200, 'Burglar alarm system installation', 7, '9123456789', 'Krishnalanka', true),
('provider7', 'Smart Lock Installation', 800, 'Smart door lock installation and setup', 5, '8765432109', 'Bhavanipuram', true),
('provider8', 'Security Consultation', 500, 'Home security assessment and consultation', 10, '7654321098', 'Suryaraopet', true),
('provider1', 'Motion Sensor Installation', 400, 'Motion detector installation service', 6, '9866234567', 'Auto Nagar', true),
('provider2', 'Window Security Bars', 600, 'Window grill and security bar installation', 8, '9848789012', 'Benz Circle', true),

-- Pest Control Services (8 services)
('provider1', 'General Pest Control', 800, 'Complete house pest control treatment', 5, '8885678901', 'Labbipet', true),
('provider2', 'Termite Control', 1200, 'Anti-termite treatment for wooden furniture', 8, '9912890123', 'Benz Circle', true),
('provider3', 'Cockroach Control', 400, 'Kitchen and bathroom cockroach treatment', 4, '9704901234', 'Krishnalanka', true),
('provider4', 'Mosquito Control', 300, 'Mosquito fogging and spray treatment', 6, '8123567890', 'Bhavanipuram', true),
('provider5', 'Rat Control', 500, 'Rodent control and prevention service', 3, '7382901234', 'Suryaraopet', true),
('provider6', 'Bed Bug Treatment', 600, 'Complete bed bug elimination service', 5, '9123456789', 'Krishnalanka', true),
('provider7', 'Ant Control', 250, 'Ant infestation control and prevention', 4, '8765432109', 'Bhavanipuram', true),
('provider8', 'Lizard Control', 200, 'Lizard control and prevention service', 3, '7654321098', 'Suryaraopet', true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_username);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_username);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_provider_services_username ON provider_services(provider_username);
CREATE INDEX IF NOT EXISTS idx_provider_services_active ON provider_services(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_services_name ON provider_services(service_name);