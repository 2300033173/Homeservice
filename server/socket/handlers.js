const { pool } = require('../config/database');

const setupSocketHandlers = (io) => {
  // Store active connections
  const activeConnections = new Map();
  const providerLocations = new Map();
  
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Join booking tracking channel
    socket.on('join-tracking', (data) => {
      const { bookingId, userRole } = data;
      const channel = `tracking_${bookingId}`;
      
      socket.join(channel);
      activeConnections.set(socket.id, { bookingId, userRole, channel });
      
      console.log(`📍 User joined tracking channel: ${channel}`);
      
      // Send initial tracking data if available
      if (providerLocations.has(bookingId)) {
        socket.emit('location-update', providerLocations.get(bookingId));
      }
    });
    
    // Provider location updates
    socket.on('provider-location', async (data) => {
      try {
        const { bookingId, lat, lng, providerId } = data;
        
        // Verify provider is assigned to this booking
        const booking = await pool.query(`
          SELECT b.id, b.customer_lat, b.customer_lng
          FROM bookings b
          JOIN providers p ON b.provider_id = p.id
          WHERE b.id = $1 AND p.id = $2
        `, [bookingId.replace('bk', ''), providerId.replace('prov', '')]);
        
        if (booking.rows.length === 0) {
          socket.emit('error', { message: 'Unauthorized location update' });
          return;
        }
        
        const bookingData = booking.rows[0];
        
        // Calculate ETA (simplified calculation)
        const customerLat = parseFloat(bookingData.customer_lat);
        const customerLng = parseFloat(bookingData.customer_lng);
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (customerLat - lat) * Math.PI / 180;
        const dLng = (customerLng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Estimate ETA (assuming average speed of 30 km/h in city)
        const etaMinutes = Math.round((distance / 30) * 60);
        
        const locationData = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          etaMinutes: Math.max(etaMinutes, 1), // Minimum 1 minute
          timestamp: new Date().toISOString(),
          distance: distance.toFixed(2)
        };
        
        // Store location data
        providerLocations.set(bookingId, locationData);
        
        // Broadcast to all users in the tracking channel
        const channel = `tracking_${bookingId}`;
        io.to(channel).emit('location-update', locationData);
        
        console.log(`📍 Location update for booking ${bookingId}: ${lat}, ${lng} (ETA: ${etaMinutes}min)`);
        
      } catch (error) {
        console.error('Provider location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });
    
    // Booking status updates
    socket.on('booking-status', async (data) => {
      try {
        const { bookingId, status, userRole } = data;
        
        // Update booking status in database
        await pool.query(`
          UPDATE bookings 
          SET status = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `, [status, bookingId.replace('bk', '')]);
        
        // Broadcast status update to all users in the tracking channel
        const channel = `tracking_${bookingId}`;
        io.to(channel).emit('status-update', {
          bookingId,
          status,
          timestamp: new Date().toISOString(),
          updatedBy: userRole
        });
        
        console.log(`📋 Booking ${bookingId} status updated to: ${status}`);
        
      } catch (error) {
        console.error('Booking status update error:', error);
        socket.emit('error', { message: 'Failed to update booking status' });
      }
    });
    
    // Provider availability updates
    socket.on('provider-availability', async (data) => {
      try {
        const { providerId, isAvailable } = data;
        
        await pool.query(`
          UPDATE providers 
          SET is_available = $1
          WHERE id = $2
        `, [isAvailable, providerId.replace('prov', '')]);
        
        // Broadcast availability update
        io.emit('provider-availability-update', {
          providerId,
          isAvailable,
          timestamp: new Date().toISOString()
        });
        
        console.log(`👷 Provider ${providerId} availability: ${isAvailable ? 'available' : 'unavailable'}`);
        
      } catch (error) {
        console.error('Provider availability update error:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });
    
    // Chat messages (for customer-provider communication)
    socket.on('send-message', async (data) => {
      try {
        const { bookingId, message, senderRole, senderId } = data;
        
        // Verify user is part of this booking
        const booking = await pool.query(`
          SELECT customer_id, provider_id
          FROM bookings b
          JOIN providers p ON b.provider_id = p.id
          WHERE b.id = $1
        `, [bookingId.replace('bk', '')]);
        
        if (booking.rows.length === 0) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }
        
        const bookingData = booking.rows[0];
        const isAuthorized = (senderRole === 'customer' && senderId == bookingData.customer_id) ||
                           (senderRole === 'provider' && senderId == bookingData.provider_id);
        
        if (!isAuthorized) {
          socket.emit('error', { message: 'Unauthorized message' });
          return;
        }
        
        const messageData = {
          bookingId,
          message,
          senderRole,
          senderId,
          timestamp: new Date().toISOString()
        };
        
        // Broadcast message to booking channel
        const channel = `tracking_${bookingId}`;
        io.to(channel).emit('new-message', messageData);
        
        console.log(`💬 Message in booking ${bookingId} from ${senderRole}`);
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        console.log(`🔌 Client disconnected from ${connection.channel}: ${socket.id}`);
        activeConnections.delete(socket.id);
      } else {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  // Periodic cleanup of old location data
  setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [bookingId, locationData] of providerLocations.entries()) {
      const locationTime = new Date(locationData.timestamp).getTime();
      if (now - locationTime > maxAge) {
        providerLocations.delete(bookingId);
        console.log(`🧹 Cleaned up old location data for booking ${bookingId}`);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
  
  console.log('🚀 Socket.IO handlers initialized');
};

module.exports = { setupSocketHandlers };