import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
} from '@mui/material';
import { supabase } from '../config/supabase';

const MyBookings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_username', user.username)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'confirmed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't made any bookings yet
            </Typography>
            <Button variant="contained" href="/services">
              Browse Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      {booking.service}
                    </Typography>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Provider: {booking.provider_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Date: {booking.date} at {booking.time}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Duration: {booking.duration} hour(s)
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Address: {booking.address}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      ₹{booking.total_amount}
                    </Typography>
                    {booking.status !== 'completed' && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/track/${booking.id}`)}
                      >
                        Track Order
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyBookings;