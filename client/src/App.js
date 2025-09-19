import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';
import { CacheManager, cleanup } from './utils/performance';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ServiceSearch = lazy(() => import('./pages/ServiceSearch'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const ProviderServices = lazy(() => import('./pages/ProviderServices'));

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // Performance optimizations on app load
    const initializeApp = () => {
      // Clear expired cache entries
      CacheManager.clearExpired();
      
      // Preload critical resources
      if (user) {
        // Preload user-specific data
        import('./pages/CustomerDashboard').catch(() => {});
        if (user.role === 'provider') {
          import('./pages/ProviderDashboard').catch(() => {});
        }
      }
      
      // Setup periodic cleanup
      const cleanupInterval = setInterval(cleanup, 300000); // 5 minutes
      return () => clearInterval(cleanupInterval);
    };
    
    const cleanupFn = initializeApp();
    return cleanupFn;
  }, [user]);

  const getDashboard = () => {
    if (!user) return <CustomerDashboard />;
    switch (user.role) {
      case 'admin': return <AdminDashboard key={`admin-${Date.now()}`} />;
      case 'provider': return <ProviderDashboard key={`provider-${Date.now()}`} />;
      case 'customer': return <CustomerDashboard key={`customer-${Date.now()}`} />;
      default: return <CustomerDashboard key={`default-${Date.now()}`} />;
    }
  };

  const LoadingFallback = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh' 
    }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={getDashboard()} />
          <Route path="/services" element={<ServiceSearch />} />
          <Route path="/book/:providerId" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/track/:bookingId" element={<TrackingPage />} />
          <Route path="/provider-services" element={<ProviderServices />} />
        </Routes>
      </Suspense>
    </Box>
  );
}

export default App;