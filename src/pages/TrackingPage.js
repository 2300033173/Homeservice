import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Build,
  Star,
  LocationOn,
  Phone,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const TrackingPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!error && data) {
        setBooking(data);
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
    }
    setLoading(false);
  };

  const getStepStatus = (stepStatus, currentStatus) => {
    const statusOrder = ['confirmed', 'en_route', 'in_progress', 'completed'];
    const stepIndex = statusOrder.indexOf(stepStatus);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const steps = [
    {
      label: 'Booking Confirmed',
      status: 'confirmed',
      icon: <CheckCircle />,
      description: 'Your booking has been confirmed and assigned to a service provider',
    },
    {
      label: 'Provider En Route',
      status: 'en_route',
      icon: <LocationOn />,
      description: 'Service provider is on the way to your location',
    },
    {
      label: 'Service In Progress',
      status: 'in_progress',
      icon: <Build />,
      description: 'Service provider has started working on your request',
    },
    {
      label: 'Service Completed',
      status: 'completed',
      icon: <Star />,
      description: 'Service has been completed successfully',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading tracking information...</Typography>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Booking not found</Typography>
      </Container>
    );
  }

  const activeStep = steps.findIndex(step => step.status === booking.status);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Track Your Service
      </Typography>

      {/* Booking Info Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mr: 2,
                width: 56,
                height: 56,
              }}
            >
              {booking.service.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {booking.service}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Booking ID: #{booking.id}
              </Typography>
              <Chip
                label={booking.status.replace('_', ' ').toUpperCase()}
                color={booking.status === 'completed' ? 'success' : 'primary'}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Provider</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.provider_name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Date & Time</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.date} at {booking.time}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.duration} hour(s)
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Amount</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                ₹{booking.total_amount}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Progress Stepper */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Service Progress
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.status, booking.status);
              
              return (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: stepStatus === 'completed' ? 'success.main' : 
                                  stepStatus === 'active' ? 'primary.main' : 'grey.300',
                          color: 'white',
                        }}
                      >
                        {step.icon}
                      </Avatar>
                    )}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    
                    {stepStatus === 'active' && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            },
                          }} 
                        />
                        <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>
                          In Progress...
                        </Typography>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>

      {/* Contact Info */}
      {booking.status !== 'completed' && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Provider
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body1">
                {booking.provider_phone || 'Contact through app'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default TrackingPage;