import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Visibility, Warning, ArrowBack } from '@mui/icons-material';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Load base services data
    const baseServices = [
      { id: 1, name: 'Home Cleaning', providers: 8, avgPrice: 400, complaints: 2, totalBookings: 150 },
      { id: 2, name: 'Plumbing Repairs', providers: 8, avgPrice: 600, complaints: 1, totalBookings: 120 },
      { id: 3, name: 'Electrical Repairs', providers: 8, avgPrice: 550, complaints: 0, totalBookings: 95 },
      { id: 4, name: 'Painting', providers: 8, avgPrice: 450, complaints: 3, totalBookings: 80 },
      { id: 5, name: 'Handyman', providers: 8, avgPrice: 400, complaints: 1, totalBookings: 110 },
      { id: 6, name: 'AC Repair', providers: 5, avgPrice: 800, complaints: 4, totalBookings: 65 },
    ];
    
    // Load provider-added services
    const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
    const providerServicesList = providerServices.map(service => ({
      id: service.id,
      name: service.service_name,
      providers: 1,
      avgPrice: service.price,
      complaints: Math.floor(Math.random() * 3), // Random complaints for demo
      totalBookings: Math.floor(Math.random() * 50) + 10
    }));
    
    setServices([...baseServices, ...providerServicesList]);
  }, []);

  const deleteService = (serviceId) => {
    // Remove from services list
    setServices(services.filter(s => s.id !== serviceId));
    
    // Remove from provider services in localStorage
    const providerServices = JSON.parse(localStorage.getItem('providerServices') || '[]');
    const updatedProviderServices = providerServices.filter(s => s.id !== serviceId);
    localStorage.setItem('providerServices', JSON.stringify(updatedProviderServices));
    
    setOpenDialog(false);
    setSelectedService(null);
  };

  const confirmDelete = (service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Service Management
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            All Services
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Name</TableCell>
                  <TableCell>Providers</TableCell>
                  <TableCell>Avg Price</TableCell>
                  <TableCell>Total Bookings</TableCell>
                  <TableCell>Complaints</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.providers}</TableCell>
                    <TableCell>₹{service.avgPrice}</TableCell>
                    <TableCell>{service.totalBookings}</TableCell>
                    <TableCell>
                      <Chip
                        label={service.complaints}
                        color={service.complaints > 2 ? 'error' : service.complaints > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.complaints > 3 ? 'Under Review' : 'Active'}
                        color={service.complaints > 3 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => confirmDelete(service)}
                        title={service.complaints < 3 ? 'Can only delete services with 3+ complaints' : 'Delete service'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Confirm Service Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedService?.name}"? 
            This action cannot be undone and will affect {selectedService?.providers} providers 
            and {selectedService?.totalBookings} bookings.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark">
              This service has {selectedService?.complaints} complaints, which is why deletion is allowed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteService(selectedService?.id)} 
            color="error" 
            variant="contained"
          >
            Delete Service
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminServices;