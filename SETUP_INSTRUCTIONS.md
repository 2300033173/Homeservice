# HouseMate Setup Instructions

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to SQL Editor
3. Run the SQL commands from `supabase_setup.sql` to create tables
4. Go to Settings > API to get your project URL and anon key
5. Update `client/src/config/supabase.js` with your credentials:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
   ```



## 3. Default Login Credentials

### Admin Login
- Username: `ADMIN`
- Password: `ADMIN`

### Customer/Provider Registration
- Users can register with any username/password
- Choose role during registration (Customer/Provider)

## 4. Features by Role

### Customer
- Book services
- Track service progress
- View booking history
- Delete bookings

### Service Provider
- View assigned bookings
- Update service status (start/complete)
- Toggle online/offline status
- View earnings and statistics

### Admin
- View all bookings
- Delete services/bookings
- Monitor all activities
- Access to all data

## 5. Run the Project

```bash
cd client
npm install
npm start
```

The application will be available at http://localhost:3000