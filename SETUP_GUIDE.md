# HouseMate Platform Setup Guide

## 🏠 Welcome to HouseMate
A comprehensive home services platform connecting homeowners in Vijayawada with verified local service professionals.

## 📋 Prerequisites

Before setting up HouseMate, ensure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
3. **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Setup

### Option 1: Automated Setup (Windows)
```bash
# Run the setup script
setup.bat
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

2. **Environment Configuration**
```bash
# Copy environment template
cp server/.env.example server/.env
```

3. **Update Environment Variables**
Edit `server/.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=housemate
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Admin Credentials
ADMIN_USERNAME=ADMIN
ADMIN_PASSWORD=ADMIN
```

## 🗄️ Database Setup

1. **Create Database**
```sql
CREATE DATABASE housemate;
```

2. **Start the Server** (it will auto-create tables)
```bash
cd server
npm run dev
```

3. **Seed Sample Data**
```bash
cd server
npm run seed
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev
```

### Individual Services
```bash
# Backend only
cd server
npm run dev

# Frontend only (in another terminal)
cd client
npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👥 Default Login Credentials

### Admin Access
- **Email**: admin@housemate.in or ADMIN
- **Password**: ADMIN

### Sample Provider (after seeding)
- **Email**: lakshmi.devi@housemate.in
- **Password**: provider123

### Customer Registration
- Register new customers through the signup page

## 🏗️ Project Structure

```
HouseMate/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database configuration
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication & validation
│   ├── socket/            # Real-time functionality
│   └── scripts/           # Database seeding
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── services/      # API services
└── package.json           # Root package configuration
```

## 🎯 Key Features

### For Customers
- Browse and search services
- Book verified professionals
- Real-time tracking
- Secure payments in INR
- Rate and review services

### For Service Providers
- Profile management
- Availability calendar
- Job management
- Earnings tracking
- KYC verification

### For Admins
- Provider approval system
- Analytics dashboard
- Booking oversight
- Promo code management
- Platform monitoring

## 🌍 Location & Services

**Base Location**: Vijayawada, Andhra Pradesh, India
**Currency**: Indian Rupees (₹)

### Available Services
- Home Cleaning & Deep Cleaning
- Plumbing Repairs & Installation
- Electrical Services
- Carpentry & Handyman
- Appliance Repair
- Pest Control
- Gardening & Landscaping
- And 20+ more services

## 📱 Technology Stack

### Frontend
- React 18 with Hooks
- Material-UI (MUI)
- Redux Toolkit
- Socket.IO Client
- React Router
- Framer Motion

### Backend
- Node.js with Express
- PostgreSQL with PostGIS
- Socket.IO for real-time features
- JWT Authentication
- Stripe for payments
- Multer for file uploads

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Build for production
npm run build

# Seed database with sample data
cd server && npm run seed

# Run tests (when available)
npm test
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
CLIENT_URL=https://your-domain.com
DB_HOST=your-production-db-host
STRIPE_SECRET_KEY=sk_live_your_live_key
```

### Build Commands
```bash
# Build client
cd client && npm run build

# Start production server
cd server && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For setup issues or questions:
- Check the troubleshooting section below
- Create an issue on GitHub
- Contact the development team

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in .env
   - Verify database exists

2. **Port Already in Use**
   - Change ports in package.json scripts
   - Kill existing processes on ports 3000/5000

3. **Module Not Found**
   - Run `npm install` in both server and client directories
   - Clear node_modules and reinstall if needed

4. **CORS Issues**
   - Check CLIENT_URL in server .env
   - Verify proxy setting in client package.json

### Reset Database
```bash
# Drop and recreate database
DROP DATABASE housemate;
CREATE DATABASE housemate;

# Restart server to recreate tables
cd server && npm run dev

# Reseed data
npm run seed
```

## 📈 Next Steps

After successful setup:
1. Customize the branding and colors
2. Add your payment gateway credentials
3. Configure email/SMS services
4. Set up monitoring and logging
5. Deploy to your preferred hosting platform

---

**Happy Coding! 🎉**

Built with ❤️ for Vijayawada, Andhra Pradesh