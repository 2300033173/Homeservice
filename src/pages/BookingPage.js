import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { supabase } from '../config/supabase';

const BookingPage = () => {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '',
    duration: 1,
    paymentMethod: 'cash',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.date || !bookingData.time || !bookingData.address) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Get service details from localStorage or use defaults
      const serviceData = JSON.parse(localStorage.getItem('selectedService') || '{}');
      
      const booking = {
        provider_name: serviceData.provider || 'Service Provider',
        provider_phone: serviceData.phone || '9999999999',
        service: serviceData.name || 'Home Service',
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.address,
        duration: bookingData.duration,
        payment_method: bookingData.paymentMethod,
        instructions: bookingData.instructions,
        total_amount: (serviceData.price || 500) * bookingData.duration,
        status: 'confirmed',
        customer_username: user.username,
        provider_username: serviceData.provider || 'provider1'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (error) {
        alert('Booking failed. Please try again.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      alert('Booking failed. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="success" sx={{ mb: 4 }}>
          Booking confirmed successfully! Redirecting to dashboard...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Book Service
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Booking Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📅 Select Service Date
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                    }
                  }}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🕐 Preferred Time Slot
                </Typography>
                <TextField
                  fullWidth
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                    }
                  }}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Service Address"
                multiline
                rows={3}
                value={bookingData.address}
                onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                  }
                }}
                placeholder="Enter your complete address in Vijayawada"
                required
              />

              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={bookingData.duration}
                onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                sx={{ mb: 3 }}
                inputProps={{ min: 1, max: 8 }}
              />

              <TextField
                fullWidth
                select
                label="Payment Method"
                value={bookingData.paymentMethod}
                onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}
                sx={{ mb: 3 }}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={2}
                value={bookingData.instructions}
                onChange={(e) => setBookingData({...bookingData, instructions: e.target.value})}
                sx={{ mb: 3 }}
                placeholder="Any special requirements or instructions"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleBooking}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Booking Summary
              </Typography>
              {(() => {
                const serviceData = JSON.parse(localStorage.getItem('selectedService') || '{}');
                const price = serviceData.price || 500;
                return (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Service</Typography>
                      <Typography variant="body1">{serviceData.name || 'Home Service'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Provider</Typography>
                      <Typography variant="body1">{serviceData.provider || 'Service Provider'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1">{bookingData.duration} hour(s)</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Rate</Typography>
                      <Typography variant="body1">₹{price}/hour</Typography>
                    </Box>
                    <Box sx={{ mb: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="h6" color="primary.main">
                        Total: ₹{price * bookingData.duration}
                      </Typography>
                    </Box>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingPage;