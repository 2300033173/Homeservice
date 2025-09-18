import React, { useState, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Box,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const SearchSuggestions = ({ onServiceSelect, placeholder = "Search for services..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_services')
        .select('service_name')
        .eq('is_active', true);

      if (!error && data) {
        const uniqueServices = [...new Set(data.map(s => s.service_name))];
        setAllServices(uniqueServices);
      } else {
        // Fallback services
        setAllServices([
          'Home Deep Cleaning', 'Regular House Cleaning', 'Kitchen Deep Cleaning',
          'Plumbing Repairs', 'Bathroom Plumbing', 'Kitchen Plumbing',
          'Electrical Repairs', 'Fan Installation', 'Light Fitting',
          'AC Installation', 'AC Repair', 'AC Servicing',
          'House Painting', 'Wall Painting', 'Waterproofing',
          'General Repairs', 'Furniture Assembly', 'Door Repair',
          'Pest Control', 'Termite Control', 'CCTV Installation'
        ]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const filtered = allServices.filter(service =>
        service.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (service) => {
    setSearchQuery(service);
    setShowSuggestions(false);
    onServiceSelect(service);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          sx: { 
            bgcolor: 'white', 
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
            },
          },
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 200,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <List sx={{ p: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white',
                  },
                }}
              >
                <ListItemIcon>
                  <Search sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchSuggestions;