import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Card, CardContent, Paper } from '@mui/material';
import { CleaningServices, Plumbing, ElectricalServices, Build, Home, Security } from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const services = [
    { name: 'Home Cleaning', icon: <CleaningServices />, count: '50+ Professionals', color: '#667eea' },
    { name: 'Plumbing', icon: <Plumbing />, count: '30+ Professionals', color: '#764ba2' },
    { name: 'Electrical', icon: <ElectricalServices />, count: '25+ Professionals', color: '#f093fb' },
    { name: 'Handyman', icon: <Build />, count: '40+ Professionals', color: '#4facfe' },
    { name: 'Home Security', icon: <Security />, count: '15+ Professionals', color: '#43e97b' },
    { name: 'AC Services', icon: <Home />, count: '20+ Professionals', color: '#38f9d7' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          sx={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 6,
            textAlign: 'center',
            mb: 6,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🏠 HouseMate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Your Trusted Home Services Platform in Vijayawada
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Connect with verified local service professionals for all your home needs. 
            Book instantly, track in real-time, and enjoy hassle-free home services.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ 
              px: 6, 
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            Get Started Today
          </Button>
        </Paper>

        {/* Services Grid */}
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            mb: 4, 
            color: 'white', 
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Our Services
        </Typography>
        
        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={service.name}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                  },
                }}
                onClick={() => navigate('/services')}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      mb: 2,
                      '& svg': {
                        fontSize: '3rem',
                        color: service.color,
                        filter: `drop-shadow(0 4px 8px ${service.color}40)`,
                      },
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Paper
          sx={{
            mt: 6,
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
            Why Choose HouseMate?
          </Typography>
          <Grid container spacing={3}>
            {[
              { title: '✅ Verified Professionals', desc: 'All service providers are background verified' },
              { title: '⚡ Instant Booking', desc: 'Book services in just a few clicks' },
              { title: '📍 Real-time Tracking', desc: 'Track your service provider in real-time' },
              { title: '💰 Transparent Pricing', desc: 'No hidden charges, pay what you see' },
              { title: '🔒 Secure Payments', desc: 'Multiple payment options with full security' },
              { title: '⭐ Quality Assured', desc: 'Rated services with customer reviews' },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;