import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Business,
  Home,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { registerUser } from '../store/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState(0); // 0: Customer, 1: Provider
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles = ['customer', 'provider'];
  const roleLabels = ['Customer', 'Service Provider'];
  const roleIcons = [<Person />, <Business />];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        registerUser({
          ...data,
          phone: `+91-${data.phone}`,
          role: roles[selectedRole],
        })
      );

      if (result.type === 'auth/register/fulfilled') {
        navigate('/dashboard');
      } else {
        setError('root', { message: result.payload });
      }
    } catch (error) {
      setError('root', { message: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (event, newValue) => {
    setSelectedRole(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Home sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  HouseMate
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Join HouseMate
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account to get started
              </Typography>
            </Box>

            {/* Role Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                I want to join as a
              </Typography>
              <Tabs
                value={selectedRole}
                onChange={handleRoleChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 60,
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                }}
              >
                {roleLabels.map((label, index) => (
                  <Tab
                    key={label}
                    icon={roleIcons[index]}
                    label={label}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    placeholder="9876543210"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter 10-digit mobile number starting with 6-9',
                      },
                    })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    variant="outlined"
                    placeholder="520001"
                    {...register('pincode', {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[1-9][0-9]{5}$/,
                        message: 'Invalid pincode',
                      },
                    })}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="Enter your full address in Vijayawada"
                    {...register('address', {
                      required: 'Address is required',
                    })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('agreeToTerms', {
                        required: 'You must agree to the terms and conditions',
                      })}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link to="/terms" style={{ color: '#2563EB' }}>
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" style={{ color: '#2563EB' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.agreeToTerms && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {errors.agreeToTerms.message}
                  </Typography>
                )}
              </Box>

              {errors.root && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.root.message}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mt: 3,
                }}
              >
                {isLoading ? 'Creating Account...' : `Create ${roleLabels[selectedRole]} Account`}
              </Button>
            </form>

            {/* Login Link */}
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>

            {/* Back to Home */}
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ textTransform: 'none' }}
              >
                ← Back to Home
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPage;