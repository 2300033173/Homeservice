const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Vijayawada Service Providers Data
const vijayawadaProviders = [
  // Home Cleaning
  { name: 'Smart City Care Cleaning', phone: '+91-9951779512', service: 'Home Cleaning', experience: 5, rate: 400, area: 'Benz Circle' },
  { name: 'Vblue House Cleaning', phone: '+91-8739089387', service: 'Home Cleaning', experience: 3, rate: 350, area: 'Patamata' },
  { name: 'I Smart Housekeeping Services', phone: '+91-9848123456', service: 'Home Cleaning', experience: 4, rate: 380, area: 'Governorpet' },
  
  // Plumbing
  { name: 'Venkata Ramana', phone: '+91-9876543204', service: 'Plumbing Repairs', experience: 10, rate: 600, area: 'Patamata' },
  { name: 'Srinivas Rao', phone: '+91-9876543205', service: 'Drain Cleaning', experience: 8, rate: 450, area: 'Kankipadu' },
  { name: 'Murali Krishna', phone: '+91-9876543206', service: 'Plumbing Installation', experience: 12, rate: 700, area: 'Gunadala' },
  
  // Electrical
  { name: 'Ravi Teja', phone: '+91-9876543207', service: 'Electrical Repairs', experience: 9, rate: 550, area: 'Moghalrajpuram' },
  { name: 'Prasad Babu', phone: '+91-9876543208', service: 'Lighting Installation', experience: 6, rate: 500, area: 'Suryaraopet' },
  { name: 'Naresh Kumar', phone: '+91-9876543209', service: 'Electrical Wiring', experience: 11, rate: 650, area: 'Bhavanipuram' },
  
  // Painting
  { name: 'Ramesh Painter', phone: '+91-9876543210', service: 'Painting', experience: 8, rate: 400, area: 'Gandhinagar' },
  { name: 'Krishna Murthy', phone: '+91-9876543211', service: 'Wall Treatments', experience: 6, rate: 450, area: 'Ajit Singh Nagar' },
  
  // Carpentry
  { name: 'Sai Kumar', phone: '+91-9876543212', service: 'Carpentry', experience: 15, rate: 600, area: 'Vidyadharapuram' },
  { name: 'Balaji Rao', phone: '+91-9876543213', service: 'Furniture Assembly', experience: 5, rate: 350, area: 'Poranki' },
  { name: 'Venkateswara Rao', phone: '+91-9876543214', service: 'Woodwork', experience: 12, rate: 550, area: 'Nunna' },
  
  // Appliance Services
  { name: 'Suresh Technician', phone: '+91-9876543215', service: 'Appliance Repair', experience: 7, rate: 500, area: 'Mylavaram' },
  { name: 'Mahesh Kumar', phone: '+91-9876543216', service: 'AC Installation', experience: 9, rate: 800, area: 'Ibrahimpatnam' },
  { name: 'Rajesh AC', phone: '+91-9876543217', service: 'AC Repair', experience: 8, rate: 600, area: 'Penamaluru' },
  
  // Pest Control
  { name: 'Pest Control Raju', phone: '+91-9876543218', service: 'Pest Control', experience: 6, rate: 1200, area: 'Machavaram' },
  { name: 'Exterminator Siva', phone: '+91-9876543219', service: 'Pest Extermination', experience: 10, rate: 1500, area: 'Kesarapalli' },
  
  // Gardening
  { name: 'Garden Guru Prasad', phone: '+91-9876543220', service: 'Lawn Care', experience: 5, rate: 400, area: 'Tadepalli' },
  { name: 'Landscaper Ravi', phone: '+91-9876543221', service: 'Landscaping', experience: 8, rate: 600, area: 'Mangalagiri' },
  
  // Handyman
  { name: 'Handy Ramesh', phone: '+91-9876543222', service: 'Handyman', experience: 7, rate: 450, area: 'Gollapudi' },
  { name: 'Fix-it Venkat', phone: '+91-9876543223', service: 'Small Repairs', experience: 4, rate: 300, area: 'Jaggayyapeta' },
  
  // Specialized Services
  { name: 'Flooring Expert Sai', phone: '+91-9876543224', service: 'Flooring Installation', experience: 10, rate: 700, area: 'Vuyyuru' },
  { name: 'Tile Master Krishna', phone: '+91-9876543225', service: 'Tile Cleaning', experience: 6, rate: 400, area: 'Nandigama' },
  { name: 'Roof Repair Raju', phone: '+91-9876543226', service: 'Roofing Repair', experience: 12, rate: 800, area: 'Tiruvuru' },
  { name: 'Gutter Cleaner Babu', phone: '+91-9876543227', service: 'Gutter Cleaning', experience: 5, rate: 350, area: 'Challapalli' },
  { name: 'Pressure Wash Pro', phone: '+91-9876543228', service: 'Pressure Washing', experience: 4, rate: 500, area: 'Avanigadda' },
  { name: 'Water Tank Cleaner', phone: '+91-9876543229', service: 'Water Tank Cleaning', experience: 8, rate: 600, area: 'Gudivada' },
  { name: 'Mold Expert Ravi', phone: '+91-9876543230', service: 'Mold Remediation', experience: 9, rate: 1000, area: 'Pedana' }
];

// Service Categories
const serviceCategories = [
  { name: 'Home Cleaning', description: 'Regular house cleaning services', base_price: 300, icon: '🧹' },
  { name: 'Deep Cleaning', description: 'Thorough deep cleaning services', base_price: 500, icon: '🧽' },
  { name: 'Carpet & Upholstery Cleaning', description: 'Professional carpet and furniture cleaning', base_price: 400, icon: '🛋️' },
  { name: 'Window & Glass Cleaning', description: 'Window and glass surface cleaning', base_price: 250, icon: '🪟' },
  { name: 'Plumbing Repairs & Installation', description: 'All plumbing repair and installation services', base_price: 600, icon: '🔧' },
  { name: 'Drain Cleaning & Unclogging', description: 'Drain and pipe cleaning services', base_price: 450, icon: '🚿' },
  { name: 'Electrical Repairs & Wiring', description: 'Electrical repair and wiring services', base_price: 550, icon: '⚡' },
  { name: 'Lighting Installation & Fixtures', description: 'Light installation and fixture services', base_price: 500, icon: '💡' },
  { name: 'Painting & Wall Treatments', description: 'Interior and exterior painting services', base_price: 400, icon: '🎨' },
  { name: 'Handyman & Small Repairs', description: 'General handyman and small repair services', base_price: 350, icon: '🔨' },
  { name: 'Furniture Assembly', description: 'Furniture assembly and installation', base_price: 350, icon: '🪑' },
  { name: 'Carpentry & Woodwork', description: 'Custom carpentry and woodwork services', base_price: 600, icon: '🪚' },
  { name: 'Appliance Installation & Repair', description: 'Home appliance services', base_price: 500, icon: '🔌' },
  { name: 'HVAC Servicing & Maintenance', description: 'Heating and cooling system services', base_price: 700, icon: '❄️' },
  { name: 'Air Conditioner Installation & Repair', description: 'AC installation and repair services', base_price: 800, icon: '🌬️' },
  { name: 'Pest Control & Extermination', description: 'Professional pest control services', base_price: 1200, icon: '🐛' },
  { name: 'Lawn Care & Gardening', description: 'Garden and lawn maintenance services', base_price: 400, icon: '🌱' },
  { name: 'Landscaping & Planting', description: 'Professional landscaping services', base_price: 600, icon: '🌳' },
  { name: 'Pool Cleaning & Maintenance', description: 'Swimming pool cleaning services', base_price: 800, icon: '🏊' },
  { name: 'Moving & Packing Assistance', description: 'Moving and packing services', base_price: 1000, icon: '📦' },
  { name: 'Interior Design Consultation', description: 'Professional interior design advice', base_price: 1500, icon: '🏠' },
  { name: 'Home Automation & Smart Systems', description: 'Smart home installation services', base_price: 2000, icon: '📱' },
  { name: 'Roofing Inspection & Repair', description: 'Roof inspection and repair services', base_price: 800, icon: '🏘️' },
  { name: 'Flooring Installation & Repair', description: 'Floor installation and repair services', base_price: 700, icon: '🏗️' },
  { name: 'Tile & Grout Cleaning', description: 'Professional tile and grout cleaning', base_price: 400, icon: '🧱' },
  { name: 'Gutter Cleaning & Maintenance', description: 'Gutter cleaning and maintenance services', base_price: 350, icon: '🏠' },
  { name: 'Pressure Washing', description: 'High-pressure cleaning services', base_price: 500, icon: '💦' },
  { name: 'Mold Inspection & Remediation', description: 'Mold inspection and removal services', base_price: 1000, icon: '🔍' },
  { name: 'Water Tank Cleaning & Purification', description: 'Water tank cleaning and purification', base_price: 600, icon: '💧' }
];

// Vijayawada areas with coordinates
const vijayawadaAreas = [
  { name: 'Benz Circle', lat: 16.5062, lng: 80.6480 },
  { name: 'Governorpet', lat: 16.5138, lng: 80.6414 },
  { name: 'Labbipet', lat: 16.5089, lng: 80.6389 },
  { name: 'Patamata', lat: 16.5180, lng: 80.6278 },
  { name: 'Kankipadu', lat: 16.4789, lng: 80.6156 },
  { name: 'Gunadala', lat: 16.4956, lng: 80.6711 },
  { name: 'Moghalrajpuram', lat: 16.5234, lng: 80.6445 },
  { name: 'Suryaraopet', lat: 16.5167, lng: 80.6389 },
  { name: 'Bhavanipuram', lat: 16.5089, lng: 80.6556 },
  { name: 'Gandhinagar', lat: 16.5234, lng: 80.6278 }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert service categories
    console.log('📋 Inserting service categories...');
    for (const category of serviceCategories) {
      await pool.query(`
        INSERT INTO service_categories (name, description, base_price, icon_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.base_price, category.icon]);
    }

    // Get service category IDs
    const categoriesResult = await pool.query('SELECT id, name FROM service_categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert providers
    console.log('👷 Inserting service providers...');
    for (const provider of vijayawadaProviders) {
      const hashedPassword = await bcrypt.hash('provider123', 10);
      const email = `${provider.name.toLowerCase().replace(/\\s+/g, '.')}@housemate.in`;
      const area = vijayawadaAreas[Math.floor(Math.random() * vijayawadaAreas.length)];
      
      // Insert user
      const userResult = await pool.query(`
        INSERT INTO users (email, password, name, role, phone, address, city, state, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [
        email,
        hashedPassword,
        provider.name,
        'provider',
        provider.phone,
        `${provider.area}, Vijayawada`,
        'Vijayawada',
        'Andhra Pradesh',
        true
      ]);

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // Find matching service category
        let serviceCategories = [];
        for (const [catName, catId] of Object.entries(categoryMap)) {
          if (catName.toLowerCase().includes(provider.service.toLowerCase()) || 
              provider.service.toLowerCase().includes(catName.toLowerCase().split(' ')[0])) {
            serviceCategories.push(catId);
            break;
          }
        }
        
        if (serviceCategories.length === 0) {
          serviceCategories = [categoryMap['Handyman & Small Repairs']]; // Default category
        }

        // Insert provider profile
        await pool.query(`
          INSERT INTO providers (
            user_id, bio, experience_years, hourly_rate, service_categories,
            location_lat, location_lng, rating, total_reviews, kyc_status, is_available
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          userId,
          `Professional ${provider.service} specialist serving ${provider.area} and surrounding areas in Vijayawada. ${provider.experience} years of experience.`,
          provider.experience,
          provider.rate,
          serviceCategories,
          area.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
          area.lng + (Math.random() - 0.5) * 0.01,
          (4.0 + Math.random() * 1.0).toFixed(1), // Random rating between 4.0-5.0
          Math.floor(Math.random() * 50) + 10, // Random reviews between 10-60
          'approved',
          true
        ]);
      }
    }

    // Insert some sample promo codes
    console.log('🎫 Inserting promo codes...');
    const promoCodes = [
      { code: 'WELCOME20', discount_percent: 20, min_order_amount: 500, expires_at: '2024-12-31' },
      { code: 'VIJAYAWADA15', discount_percent: 15, min_order_amount: 300, expires_at: '2024-12-31' },
      { code: 'FIRSTTIME25', discount_percent: 25, min_order_amount: 1000, expires_at: '2024-12-31' },
      { code: 'SUMMER10', discount_percent: 10, min_order_amount: 200, expires_at: '2024-08-31' }
    ];

    for (const promo of promoCodes) {
      await pool.query(`
        INSERT INTO promo_codes (code, discount_percent, min_order_amount, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [promo.code, promo.discount_percent, promo.min_order_amount, promo.expires_at]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Inserted ${vijayawadaProviders.length} service providers`);
    console.log(`📋 Inserted ${serviceCategories.length} service categories`);
    console.log('🏠 All data is specific to Vijayawada, Andhra Pradesh');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🎉 Seeding process completed');
    process.exit(0);
  }).catch(err => {
    console.error('💥 Seeding process failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };