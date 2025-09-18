import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
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
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { 
  People, 
  Business, 
  Assessment, 
  TrendingUp, 
  Delete,
  Analytics,
  FileDownload,
  Refresh,
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, serviceId: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setUsers(usersData);
        const customers = usersData.filter(u => u.role === 'customer').length;
        const providers = usersData.filter(u => u.role === 'provider').length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: customers,
          totalProviders: providers
        }));
      }

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsData) {
        setRecentBookings(bookingsData.slice(0, 10));
        const totalRevenue = bookingsData.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
        const pending = bookingsData.filter(b => b.status === 'confirmed').length;
        
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsData.length,
          totalRevenue: totalRevenue,
          pendingApprovals: pending,
        }));
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from('provider_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesData) {
        setServices(servicesData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  const deleteService = async (serviceId) => {
    try {
      const { error } = await supabase
        .from('provider_services')
        .delete()
        .eq('id', serviceId);

      if (!error) {
        setServices(services.filter(s => s.id !== serviceId));
        setDeleteDialog({ open: false, serviceId: null });
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const generateReport = () => {
    const reportData = {
      totalUsers: stats.totalUsers,
      totalProviders: stats.totalProviders,
      totalBookings: stats.totalBookings,
      totalRevenue: stats.totalRevenue,
      recentBookings: recentBookings,
      generatedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `housemate-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Customers', value: stats.totalUsers, icon: <People />, color: 'primary' },
          { label: 'Active Providers', value: stats.totalProviders, icon: <Business />, color: 'success' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: <Assessment />, color: 'info' },
          { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp />, color: 'warning' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${stat.color === 'primary' ? '#667eea' : 
                          stat.color === 'success' ? '#48bb78' : 
                          stat.color === 'info' ? '#4299e1' : '#ed8936'} 0%, ${
                          stat.color === 'primary' ? '#764ba2' : 
                          stat.color === 'success' ? '#38a169' : 
                          stat.color === 'info' ? '#3182ce' : '#dd6b20'} 100%)`,
              color: 'white',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Recent Bookings" />
          <Tab label="Manage Services" />
          <Tab label="Analytics" />
          <Tab label="Users" />
        </Tabs>
      </Paper>

      {/* Recent Bookings Tab */}
      <TabPanel value={activeTab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Bookings ({recentBookings.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.customer_username}</TableCell>
                      <TableCell>{booking.provider_name}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>₹{booking.total_amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          size="small"
                          color={getStatusColor(booking.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Manage Services Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              All Services ({services.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Name</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.service_name}</TableCell>
                      <TableCell>{service.provider_username}</TableCell>
                      <TableCell>₹{service.price}</TableCell>
                      <TableCell>{service.area}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={service.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, serviceId: service.id })}
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
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Booking Analytics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
                  <Typography variant="h4" color="warning.main">{stats.pendingApprovals}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.totalBookings > 0 ? Math.round((recentBookings.filter(b => b.status === 'completed').length / stats.totalBookings) * 100) : 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Revenue Analytics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Average Booking Value</Typography>
                  <Typography variant="h4" color="primary.main">
                    ₹{stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings) : 0}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Active Services</Typography>
                  <Typography variant="h4" color="info.main">
                    {services.filter(s => s.is_active).length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              All Users ({users.length})
            </Typography>
            <Grid container spacing={2}>
              {users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{user.username}</Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'provider' ? 'success' : user.role === 'admin' ? 'error' : 'primary'}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<Analytics />}
            onClick={() => setActiveTab(2)}
          >
            View Analytics
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />}
            onClick={generateReport}
          >
            Generate Report
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Business />}
            onClick={() => setActiveTab(1)}
          >
            Manage Services
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, serviceId: null })}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, serviceId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => deleteService(deleteDialog.serviceId)} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;