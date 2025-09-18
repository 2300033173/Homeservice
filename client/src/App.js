import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceSearch from './pages/ServiceSearch';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import ProfilePage from './pages/ProfilePage';
import TrackingPage from './pages/TrackingPage';
import ProviderServices from './pages/ProviderServices';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // Clear any cached data on app load
    const clearCache = () => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    };
    clearCache();
  }, []);

  const getDashboard = () => {
    if (!user) return <CustomerDashboard />;
    switch (user.role) {
      case 'admin': return <AdminDashboard key={`admin-${Date.now()}`} />;
      case 'provider': return <ProviderDashboard key={`provider-${Date.now()}`} />;
      case 'customer': return <CustomerDashboard key={`customer-${Date.now()}`} />;
      default: return <CustomerDashboard key={`default-${Date.now()}`} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
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
    </Box>
  );
}

export default App;