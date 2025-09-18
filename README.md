# 🏠 HouseMate - Home Services Platform

A comprehensive platform connecting homeowners in Vijayawada with verified local service professionals.

## 🚀 Features

- **Multi-Role Authentication** - Customer, Provider, and Admin dashboards
- **100+ Home Services** - Cleaning, Plumbing, Electrical, AC, Painting, and more
- **Real-time Booking** - Instant service booking with live tracking
- **Smart Search** - Auto-suggestions and fast service discovery
- **Modern UI** - Glass morphism design with smooth animations
- **Secure Payments** - Multiple payment options in Indian Rupees (₹)
- **Location-based** - Specifically designed for Vijayawada, Andhra Pradesh

## 🛠 Tech Stack

**Frontend:**
- React 18 with Next.js
- Material-UI (MUI)
- Modern CSS with gradients and animations

**Backend:**
- Supabase (PostgreSQL)
- Real-time database
- Row Level Security (RLS)

**Key Libraries:**
- React Router for navigation
- Material-UI for components
- Supabase client for database

## 📱 User Roles

### 👤 Customer
- Browse and search services
- Book services with real-time tracking
- Manage bookings and profile
- Rate and review services

### 🔧 Service Provider
- Add and manage services
- Accept/manage bookings
- Update service status
- Track earnings

### ⚙️ Admin
- Platform analytics and reports
- User and service management
- Delete inappropriate services
- Monitor platform activity

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/housemate.git
   cd housemate
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Setup Supabase**
   - Create a Supabase project
   - Run the SQL from `FINAL_SUPABASE_SETUP.sql`
   - Update `client/src/config/supabase.js` with your credentials

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open http://localhost:3000
   - Use demo accounts or register new ones

## 🔐 Demo Accounts

- **Admin**: Username: `ADMIN`, Password: `ADMIN`
- **Provider**: Username: `provider1`, Password: `provider1`
- **Customer**: Register a new account

## 🌍 Location & Services

**Based in:** Vijayawada, Andhra Pradesh, India  
**Currency:** Indian Rupees (₹)  
**Services:** 100+ home services across 8+ categories

### Service Categories:
- 🧹 **Cleaning** (15 services)
- 🔧 **Plumbing** (20 services)  
- ⚡ **Electrical** (20 services)
- ❄️ **AC Services** (15 services)
- 🎨 **Painting** (12 services)
- 🔒 **Security** (10 services)
- 🐛 **Pest Control** (8 services)
- 🌿 **Garden & Outdoor** (5+ services)

## 📊 Database Schema

- **users** - User authentication and roles
- **provider_services** - Service listings and details
- **bookings** - Service bookings and tracking

## 🎨 Design Features

- **Glass Morphism** - Modern translucent design
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Hover effects and transitions
- **Responsive Design** - Works on all devices
- **Fast Loading** - Optimized with caching and pagination

## 🔧 Performance Optimizations

- **Smart Caching** - 5-minute local storage cache
- **Pagination** - Load services in chunks
- **Optimized Queries** - Fetch only required fields
- **Progressive Loading** - Load more on demand

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and queries, please open an issue on GitHub.

---

**Made with ❤️ for Vijayawada** 🏠