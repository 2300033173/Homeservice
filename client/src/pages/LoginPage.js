import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { Person, Business, AdminPanelSettings } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['customer', 'provider', 'admin'];
  const roleLabels = ['Customer', 'Service Provider', 'Admin'];
  const roleIcons = [<Person key="person" />, <Business key="business" />, <AdminPanelSettings key="admin" />];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const currentRole = roles[activeTab];

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Admin login (hardcoded) - Only allow on Admin tab
    if (currentRole === 'admin') {
      if (formData.username === 'ADMIN' && formData.password === 'ADMIN') {
        const user = { username: 'ADMIN', role: 'admin', id: 1 };
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('Invalid admin credentials. Use ADMIN/ADMIN');
      }
      setLoading(false);
      return;
    }

    // Prevent admin login on other tabs
    if (formData.username === 'ADMIN' && currentRole !== 'admin') {
      setError('Admin account can only login through Admin tab');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login with Supabase - First check if user exists with correct credentials
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', formData.username)
          .eq('password', formData.password)
          .single();

        if (error || !data) {
          setError('Invalid username or password');
        } else if (data.role !== currentRole) {
          setError(`This account is registered as ${data.role}, not ${currentRole}`);
        } else {
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/dashboard');
        }
      } else {
        // Prevent admin registration
        if (formData.username === 'ADMIN' || currentRole === 'admin') {
          setError('Admin accounts cannot be registered');
          setLoading(false);
          return;
        }

        // Register with Supabase (optimized)
        const userData = {
          username: formData.username,
          password: formData.password,
          role: currentRole
        };
        
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select('id, username, role')
          .single();

        if (error) {
          if (error.code === '23505') {
            setError('Username already exists');
          } else {
            setError('Registration failed. Please try again.');
          }
        } else {
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4,
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
        >
        <Typography variant="h4" textAlign="center" sx={{ mb: 2 }}>
          Welcome to HouseMate
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </Typography>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setError(''); // Clear errors when switching tabs
            setFormData({ username: '', password: '', confirmPassword: '' }); // Reset form
            setIsLogin(true); // Reset to login mode
          }} 
          variant="fullWidth" 
          sx={{ mb: 3 }}
        >
          {roleLabels.map((label, index) => (
            <Tab key={label} label={label} icon={roleIcons[index]} iconPosition="start" />
          ))}
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            sx={{ mb: 2 }}
            required
          />

          {!isLogin && (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>

          {activeTab !== 2 && (
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(''); // Clear any previous errors
                setFormData({ username: '', password: '', confirmPassword: '' }); // Reset form
              }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          )}
        </form>


        
        {activeTab === 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
            <Typography variant="body2" textAlign="center" sx={{ fontWeight: 500 }}>
              👤 Customer Login - Book and manage home services
            </Typography>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
            <Typography variant="body2" textAlign="center" sx={{ fontWeight: 500 }}>
              🔧 Provider Login - Offer your services to customers
            </Typography>
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'white' }}>
            <Typography variant="body2" textAlign="center" sx={{ fontWeight: 500 }}>
              ⚙️ Admin Access - Platform management only
            </Typography>
          </Box>
        )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;