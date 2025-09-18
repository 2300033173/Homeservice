import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Person,
  Payment,
} from '@mui/icons-material';

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const notifs = [];

    const getTimeAgo = (dateString) => {
      const now = new Date();
      const bookingTime = new Date(dateString);
      const diffMs = now - bookingTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    };

    bookings.forEach(booking => {
      const timeAgo = getTimeAgo(booking.createdAt);
      
      if (booking.status === 'confirmed') {
        notifs.push({
          id: `booking-${booking.id}`,
          title: 'Booking Confirmed ✅',
          message: `Your ${booking.provider?.service || booking.service} service is confirmed for ${booking.date} at ${booking.time}`,
          time: timeAgo,
          icon: <CheckCircle color="success" />,
          unread: true,
        });
      }
      
      if (booking.status === 'en_route') {
        notifs.push({
          id: `enroute-${booking.id}`,
          title: 'Provider En Route 🚗',
          message: `${booking.provider?.name} is on the way to your location`,
          time: timeAgo,
          icon: <Person color="primary" />,
          unread: true,
        });
      }
      
      if (booking.status === 'in_progress') {
        notifs.push({
          id: `progress-${booking.id}`,
          title: 'Service Started 🔧',
          message: `${booking.provider?.name} has started your ${booking.provider?.service} service`,
          time: timeAgo,
          icon: <Schedule color="info" />,
          unread: true,
        });
      }
      
      if (booking.status === 'completed') {
        notifs.push({
          id: `completed-${booking.id}`,
          title: 'Service Completed ✨',
          message: `Your ${booking.provider?.service} service is completed. Total: ₹${booking.totalAmount}`,
          time: timeAgo,
          icon: <Payment color="success" />,
          unread: false,
        });
      }
    });

    if (notifs.length === 0) {
      notifs.push({
        id: 'welcome',
        title: 'Welcome to HouseMate! 🏠',
        message: 'Book your first service and get 10% off',
        time: '1 day ago',
        icon: <CheckCircle color="info" />,
        unread: true,
      });
    }

    setNotifications(notifs.slice(0, 8).reverse());
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Notifications
        </Typography>
        
        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    {notification.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Popover>
  );
};

export default NotificationPanel;