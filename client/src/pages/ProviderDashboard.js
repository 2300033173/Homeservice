import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add, Business } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const ProviderDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isOnline, setIsOnline] = useState(true);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    description: '',
    experience: '',
    phone: '',
    area: ''
  });

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_username', user.username);

      if (!error && data) {
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchBookings = async () => {
    if (!user || user.role !== 'provider') return;
    
    try {
      // Get bookings for services provided by this provider
      const { data: servicesData } = await supabase
        .from('provider_services')
        .select('service_name')
        .eq('provider_username', user.username);

      if (servicesData && servicesData.length > 0) {
        const serviceNames = servicesData.map(s => s.service_name);
        
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .in('service', serviceNames)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setBookings(data);
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const addService = async () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.experience || !serviceForm.phone || !serviceForm.area) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('provider_services')
        .insert([{
          provider_username: user.username,
          service_name: serviceForm.name,
          price: parseFloat(serviceForm.price),
          description: serviceForm.description || 'Professional service',
          experience: parseInt(serviceForm.experience),
          phone: serviceForm.phone,
          area: serviceForm.area,
          is_active: true
        }])
        .select()
        .single();

      if (!error && data) {
        setServices([...services, data]);
        setServiceForm({ name: '', price: '', description: '', experience: '', phone: '', area: '' });
        setOpenDialog(false);
        alert('Service added successfully!');
      } else {
        alert('Failed to add service. Please try again.');
      }
    } catch (err) {
      console.error('Error adding service:', err);
      alert('Error adding service. Please try again.');
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (!error) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Provider Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.username}! Manage your services and bookings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />}
            label={isOnline ? "🟢 Online" : "🔴 Offline"}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              },
            }}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                My Services ({services.length})
              </Typography>
              <List>
                {services.map((service) => (
                  <ListItem key={service.id} sx={{ border: '1px solid', borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={service.service_name}
                      secondary={`₹${service.price} • ${service.area} • ${service.experience} years exp`}
                    />
                    <Chip
                      label={service.is_active ? 'Active' : 'Inactive'}
                      color={service.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Service Bookings ({bookings.length})
              </Typography>
              <List>
                {bookings.map((booking) => (
                  <ListItem key={booking.id} sx={{ border: '1px solid', borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={`${booking.service} - ${booking.date}`}
                      secondary={`${booking.address} • ₹${booking.total_amount}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={booking.status}
                        color={booking.status === 'completed' ? 'success' : 'primary'}
                        size="small"
                      />
                      {booking.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {booking.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Service Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Service Name"
            value={serviceForm.name}
            onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label="Price (₹)"
            type="number"
            value={serviceForm.price}
            onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Experience (Years)"
            type="number"
            value={serviceForm.experience}
            onChange={(e) => setServiceForm({...serviceForm, experience: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={serviceForm.phone}
            onChange={(e) => setServiceForm({...serviceForm, phone: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Service Area"
            value={serviceForm.area}
            onChange={(e) => setServiceForm({...serviceForm, area: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={serviceForm.description}
            onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={addService} variant="contained">Add Service</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderDashboard;