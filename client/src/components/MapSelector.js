import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';

const MapSelector = ({ onLocationSelect, selectedAddress }) => {
  const [position, setPosition] = useState({ lat: 16.5062, lng: 80.6480 });
  const [manualAddress, setManualAddress] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Initialize OpenStreetMap
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      setTimeout(() => {
        initializeMap();
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    if (window.L && document.getElementById('map')) {
      const map = window.L.map('map').setView([position.lat, position.lng], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      let marker = window.L.marker([position.lat, position.lng]).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        
        if (marker) {
          map.removeLayer(marker);
        }
        marker = window.L.marker([lat, lng]).addTo(map);
        
        // Reverse geocoding
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data.display_name) {
            onLocationSelect(data.display_name);
          }
        } catch (error) {
          onLocationSelect(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });

      setMapLoaded(true);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          setPosition({ lat, lng });
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data.display_name) {
              onLocationSelect(data.display_name);
            }
          } catch (error) {
            onLocationSelect(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleManualAddress = () => {
    if (manualAddress.trim()) {
      onLocationSelect(manualAddress);
      setManualAddress('');
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        📍 Click on the map to select your location
      </Typography>
      
      <Box 
        id="map" 
        sx={{ 
          height: 300, 
          width: '100%', 
          mb: 2, 
          borderRadius: 2, 
          border: '1px solid #ddd',
          backgroundColor: '#f5f5f5'
        }}
      >
        {!mapLoaded && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <LocationOn sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography>Loading map...</Typography>
          </Box>
        )}
      </Box>
      
      <Button
        variant="contained"
        startIcon={<MyLocation />}
        onClick={getCurrentLocation}
        sx={{ mb: 2, mr: 1 }}
      >
        Use Current Location
      </Button>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Or enter address manually"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualAddress()}
        />
        <Button
          variant="outlined"
          onClick={handleManualAddress}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Set Address
        </Button>
      </Box>
      
      {selectedAddress && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Selected: {selectedAddress}
        </Alert>
      )}
    </Box>
  );
};

export default MapSelector;