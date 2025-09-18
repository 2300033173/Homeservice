import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Home } from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Home sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            HouseMate
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {user ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                },
              }}
            >
              Dashboard
            </Button>
            {user?.role === 'provider' ? (
              <Button 
                onClick={() => navigate('/provider-services')}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                  },
                }}
              >
                My Services
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/services')}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                  },
                }}
              >
                Services
              </Button>
            )}
            <Button 
              onClick={() => navigate('/profile')}
              sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                },
              }}
            >
              Profile
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 2,
                borderColor: 'primary.main',
                '&:hover': {
                  background: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;