import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const ProviderServices = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editService, setEditService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    description: '',
    experience: '',
    phone: '',
    area: ''
  });

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/login');
      return;
    }
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_username', user.username)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleAddService = () => {
    setEditService(null);
    setServiceForm({ name: '', price: '', description: '', experience: '', phone: '', area: '' });
    setOpenDialog(true);
  };

  const handleEditService = (service) => {
    setEditService(service);
    setServiceForm({
      name: service.service_name,
      price: service.price.toString(),
      description: service.description,
      experience: service.experience.toString(),
      phone: service.phone,
      area: service.area
    });
    setOpenDialog(true);
  };

  const saveService = async () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.experience || !serviceForm.phone || !serviceForm.area) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const serviceData = {
        provider_username: user.username,
        service_name: serviceForm.name,
        price: parseFloat(serviceForm.price),
        description: serviceForm.description || 'Professional service',
        experience: parseInt(serviceForm.experience),
        phone: serviceForm.phone,
        area: serviceForm.area,
        is_active: true
      };

      if (editService) {
        // Update existing service
        const { data, error } = await supabase
          .from('provider_services')
          .update(serviceData)
          .eq('id', editService.id)
          .select()
          .single();

        if (!error && data) {
          setServices(services.map(s => s.id === editService.id ? data : s));
          alert('Service updated successfully!');
        }
      } else {
        // Add new service
        const { data, error } = await supabase
          .from('provider_services')
          .insert([serviceData])
          .select()
          .single();

        if (!error && data) {
          setServices([data, ...services]);
          alert('Service added successfully!');
        }
      }

      setOpenDialog(false);
      setServiceForm({ name: '', price: '', description: '', experience: '', phone: '', area: '' });
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Error saving service. Please try again.');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)
        .select()
        .single();

      if (!error && data) {
        setServices(services.map(s => s.id === serviceId ? data : s));
      }
    } catch (err) {
      console.error('Error updating service status:', err);
    }
  };

  if (user?.role !== 'provider') {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your service offerings and pricing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddService}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            },
          }}
        >
          Add New Service
        </Button>
      </Box>

      {services.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No services added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first service to attract customers
            </Typography>
            <Button variant="contained" onClick={handleAddService}>
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} md={6} lg={4} key={service.id}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {service.service_name.charAt(0)}
                    </Avatar>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={service.is_active}
                          onChange={() => toggleServiceStatus(service.id, service.is_active)}
                          size="small"
                        />
                      }
                      label={service.is_active ? 'Active' : 'Inactive'}
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {service.service_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary.main">
                      ₹{service.price}/hr
                    </Typography>
                    <Chip
                      label={`${service.experience} years exp`}
                      size="small"
                      color="info"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📍 {service.area} • 📞 {service.phone}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditService(service)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={service.is_active ? <VisibilityOff /> : <Visibility />}
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      color={service.is_active ? 'warning' : 'success'}
                    >
                      {service.is_active ? 'Hide' : 'Show'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
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
            label="Price per Hour (₹)"
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
            label="Service Area in Vijayawada"
            value={serviceForm.area}
            onChange={(e) => setServiceForm({...serviceForm, area: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Service Description"
            multiline
            rows={3}
            value={serviceForm.description}
            onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
            placeholder="Describe your service in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={saveService} variant="contained">
            {editService ? 'Update Service' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderServices;