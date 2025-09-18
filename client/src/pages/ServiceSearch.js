import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Rating,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, LocationOn, Phone } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const ServiceSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedProviders, setDisplayedProviders] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async (pageNum = 1, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      // Check cache first
      const cacheKey = `services_page_${pageNum}`;
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) { // 5 min cache
        const cachedData = JSON.parse(cached);
        if (isLoadMore) {
          setDisplayedProviders(prev => [...prev, ...cachedData]);
        } else {
          setDisplayedProviders(cachedData);
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('provider_services')
        .select('id, service_name, provider_username, price, experience, phone, area, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const formattedProviders = data.map(service => {
          let rating = 3.5 + (service.experience * 0.15);
          if (service.experience >= 10) rating = 5.0;
          else if (service.experience >= 8) rating = 4.8;
          else if (service.experience >= 6) rating = 4.5;
          else if (service.experience >= 4) rating = 4.2;
          else if (service.experience >= 2) rating = 3.9;
          
          return {
            id: service.id,
            name: service.service_name,
            provider: service.provider_username,
            service: service.service_name,
            rating: Math.min(5.0, rating),
            experience: service.experience,
            area: service.area,
            price: service.price,
            phone: service.phone,
            description: service.description
          };
        });

        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(formattedProviders));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

        if (isLoadMore) {
          setDisplayedProviders(prev => [...prev, ...formattedProviders]);
        } else {
          setDisplayedProviders(formattedProviders);
          setProviders(formattedProviders);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        // Quick fallback data
        const quickServices = [
          { id: 1, name: 'Home Deep Cleaning', provider: 'CleanPro', service: 'Home Deep Cleaning', rating: 4.8, experience: 5, area: 'Benz Circle', price: 800, phone: '9951779512' },
          { id: 2, name: 'Plumbing Repairs', provider: 'AquaFix', service: 'Plumbing Repairs', rating: 4.7, experience: 8, area: 'Patamata', price: 600, phone: '9908495083' },
          { id: 3, name: 'Electrical Repairs', provider: 'PowerTech', service: 'Electrical Repairs', rating: 4.6, experience: 6, area: 'Governorpet', price: 550, phone: '9954598770' }
        ];
        setDisplayedProviders(quickServices);
        setProviders(quickServices);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  const filteredProviders = displayedProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProviders(nextPage, true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Find Services in Vijayawada
      </Typography>

      <TextField
        fullWidth
        placeholder="Search for services or providers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Loading services...</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredProviders.map((provider) => (
              <Grid item xs={12} md={6} key={provider.id}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              },
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}>
                    {provider.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{provider.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {provider.provider || 'Service Provider'}
                    </Typography>

                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={parseFloat(provider.rating)} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {parseFloat(provider.rating).toFixed(1)} ({provider.experience} years exp)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {provider.area}, Vijayawada
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {provider.phone}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary.main">
                    ₹{provider.price}/hr
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => {
                      localStorage.setItem('selectedService', JSON.stringify(provider));
                      navigate(`/book/${provider.id}`);
                    }}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      },
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {hasMore && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loadingMore}
            sx={{ px: 4, py: 1.5 }}
          >
            {loadingMore ? 'Loading...' : 'Load More Services'}
          </Button>
        </Box>
      )}
    </>
  )}
    </Container>
  );
};

export default ServiceSearch;