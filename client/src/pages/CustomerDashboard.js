import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchSuggestions from '../components/SearchSuggestions';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import { 
  Search, 
  CleaningServices, 
  Plumbing, 
  ElectricalServices,
  AcUnit,
  FormatPaint,
  Security,
  BugReport,
  History,
  Refresh
} from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { CacheManager } from '../utils/performance';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const serviceCategories = [
    { name: 'Cleaning', icon: <CleaningServices />, count: 0 },
    { name: 'Plumbing', icon: <Plumbing />, count: 0 },
    { name: 'Electrical', icon: <ElectricalServices />, count: 0 },
    { name: 'AC Services', icon: <AcUnit />, count: 0 },
    { name: 'Painting', icon: <FormatPaint />, count: 0 },
    { name: 'Security', icon: <Security />, count: 0 },
    { name: 'Pest Control', icon: <BugReport />, count: 0 },
  ];

  useEffect(() => {
    fetchAllServices();
    if (user) {
      fetchRecentBookings();
    }
  }, [user]);

  const fetchAllServices = async () => {
    setLoading(true);
    try {
      // Check cache first
      const cacheKey = 'dashboard_services';
      const cachedData = CacheManager.get(cacheKey);
      
      if (cachedData) {
        setServices(cachedData);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provider_services')
        .select('service_name, price')
        .eq('is_active', true)
        .order('price', { ascending: true }); // Order by price for better UX

      if (!error && data) {
        setServices(data);
        // Cache for 5 minutes
        CacheManager.set(cacheKey, data, 300000);
        
        // Update category counts
        serviceCategories.forEach(category => {
          category.count = data.filter(service => 
            service.service_name.toLowerCase().includes(category.name.toLowerCase())
          ).length;
        });
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
    setLoading(false);
  };

  const fetchRecentBookings = async () => {
    setBookingsLoading(true);
    try {
      // Check cache first
      const cacheKey = `recent_bookings_${user.username}`;
      const cachedData = CacheManager.get(cacheKey);
      
      if (cachedData) {
        setRecentBookings(cachedData);
        setBookingsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('id, service, status, date, total_amount, created_at')
        .eq('customer_username', user.username)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentBookings(data);
        // Cache for 2 minutes (shorter for real-time updates)
        CacheManager.set(cacheKey, data, 120000);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
    setBookingsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'confirmed': return 'info';
      case 'en_route': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleSearch = () => {
    navigate('/services');
  };

  const refreshBookings = () => {
    // Clear cache and fetch fresh data
    CacheManager.clear(`recent_bookings_${user.username}`);
    fetchRecentBookings();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Welcome back, {user?.username}! 👋
      </Typography>

      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            What service do you need today?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SearchSuggestions 
              onServiceSelect={(service) => {
                setSearchQuery(service);
                navigate(`/services?q=${encodeURIComponent(service)}`);
              }}
              placeholder="Search for services..."
            />
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleSearch}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                },
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Service Categories */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Service Categories ({services.length} services available)
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {serviceCategories.map((category) => {
                const categoryServices = services.filter(service => 
                  service.service_name.toLowerCase().includes(category.name.toLowerCase())
                );
                const minPrice = categoryServices.length > 0 
                  ? Math.min(...categoryServices.map(s => s.price))
                  : 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={category.name}>
                    <Card sx={{ 
                      cursor: 'pointer',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      },
                    }} onClick={() => navigate(`/services?category=${category.name}`)}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          color: 'primary.main', 
                          mb: 2,
                          '& svg': {
                            fontSize: '3rem',
                            filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
                          },
                        }}>
                          {category.icon}
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {categoryServices.length} services
                        </Typography>
                        {minPrice > 0 && (
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            From ₹{minPrice}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1, color: 'primary.main' }} />
                Recent Bookings
              </Typography>
              <Button
                size="small"
                onClick={refreshBookings}
                disabled={bookingsLoading}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                <Refresh sx={{ fontSize: 20 }} />
              </Button>
            </Box>

            {bookingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : recentBookings.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {booking.service.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {booking.service}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Chip
                              label={booking.status.replace('_', ' ')}
                              size="small"
                              color={getStatusColor(booking.status)}
                              sx={{ borderRadius: 1, mb: 0.5, fontSize: '0.75rem' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {booking.date} • ₹{booking.total_amount}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentBookings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No bookings yet
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/services')}
                  sx={{ borderRadius: 2 }}
                >
                  Book Your First Service
                </Button>
              </Box>
            )}

            {recentBookings.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/bookings')}
                  sx={{ borderRadius: 2 }}
                >
                  View All Bookings
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;