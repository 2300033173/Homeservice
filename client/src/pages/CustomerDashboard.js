import React, { useState } from 'react';
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
} from '@mui/material';
import { Search, CleaningServices, Plumbing, ElectricalServices } from '@mui/icons-material';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { name: 'Home Cleaning', icon: <CleaningServices />, price: 400 },
    { name: 'Plumbing', icon: <Plumbing />, price: 600 },
    { name: 'Electrical', icon: <ElectricalServices />, price: 550 },
  ];

  const handleSearch = () => {
    navigate('/services');
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

      <Typography variant="h6" sx={{ mb: 3 }}>
        Popular Services
      </Typography>
      
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={4} key={service.name}>
            <Card sx={{ 
              cursor: 'pointer',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              },
            }} onClick={() => navigate('/services')}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  color: 'primary.main', 
                  mb: 2,
                  '& svg': {
                    fontSize: '3rem',
                    filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
                  },
                }}>
                  {service.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From ₹{service.price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;