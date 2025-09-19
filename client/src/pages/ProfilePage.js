import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person,
  Edit,
  BookOnline,
  History,
  Star,
  Phone,
  Email,
  LocationOn,
  TrendingUp,
  Save,
  Cancel,
  PhotoCamera,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [bookings, setBookings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    profile_picture: ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedServices: 0,
    totalSpent: 0,
    avgRating: 4.5,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', user.username)
        .single();

      if (!error && data) {
        setEditData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          profile_picture: data.profile_picture || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_username', user.username)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
        const completed = data.filter(b => b.status === 'completed');
        const totalSpent = data.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
        
        setStats({
          totalBookings: data.length,
          completedServices: completed.length,
          totalSpent: totalSpent,
          avgRating: 4.5,
        });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'confirmed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Please login to view profile</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3,
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
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
                mr: 3,
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {editData.full_name || user.username}
              </Typography>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
            {!editMode ? (
              <IconButton 
                sx={{ color: 'white' }}
                onClick={() => setEditMode(true)}
              >
                <Edit />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  sx={{ color: 'white' }}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  <Save />
                </IconButton>
                <IconButton 
                  sx={{ color: 'white' }}
                  onClick={() => {
                    setEditMode(false);
                    fetchUserProfile(); // Reset to original data
                  }}
                >
                  <Cancel />
                </IconButton>
              </Box>
            )}
          </Box>
          
          <Grid container spacing={3}>
            {[
              { label: 'Total Bookings', value: stats.totalBookings, icon: <BookOnline /> },
              { label: 'Completed', value: stats.completedServices, icon: <History /> },
              { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: <TrendingUp /> },
              { label: 'Rating', value: stats.avgRating, icon: <Star /> },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1, opacity: 0.8 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <History sx={{ mr: 1, color: 'primary.main' }} />
                  Recent Bookings
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/bookings')}
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Box>

              {bookings.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {bookings.slice(0, 5).map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          borderRadius: 2,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          >
                            {booking.service.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {booking.service}
                              </Typography>
                              <Chip
                                label={booking.status}
                                size="small"
                                color={getStatusColor(booking.status)}
                                sx={{ borderRadius: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {booking.provider_name} • {booking.date}
                              </Typography>
                              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                                ₹{booking.total_amount}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(bookings.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <BookOnline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No bookings yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start by booking your first service
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/services')}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Browse Services
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<BookOnline />}
                  onClick={() => navigate('/services')}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    },
                  }}
                >
                  Book New Service
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => navigate('/bookings')}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  View All Bookings
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Account Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </Box>
                </Box>
                {editData.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {editData.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {editData.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {editData.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {editData.address || 'Vijayawada, AP'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );

  async function handleSaveProfile() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editData.full_name,
          email: editData.email,
          phone: editData.phone,
          address: editData.address,
          updated_at: new Date().toISOString()
        })
        .eq('username', user.username);

      if (error) {
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
    setLoading(false);
  }
};

export default ProfilePage;