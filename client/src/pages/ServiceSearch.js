import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { CacheManager, debounce } from '../utils/performance';

const ServiceSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('category') || '');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedProviders, setDisplayedProviders] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    // Debounced loading for better performance
    const timer = setTimeout(() => {
      fetchProviders();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Preload next page for smoother experience
  useEffect(() => {
    if (displayedProviders.length > 0 && hasMore) {
      const timer = setTimeout(() => {
        const nextPage = page + 1;
        const cacheKey = `services_page_${nextPage}`;
        if (!localStorage.getItem(cacheKey)) {
          // Preload next page silently
          fetchProviders(nextPage, true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [displayedProviders, hasMore, page]);

  const fetchProviders = async (pageNum = 1, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      // Enhanced caching with performance utilities
      const cacheKey = `services_page_${pageNum}`;
      const cachedData = CacheManager.get(cacheKey);
      
      if (cachedData) {
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

      // Optimized query - select only required fields
      const { data, error } = await supabase
        .from('provider_services')
        .select('id, service_name, provider_username, price, experience, phone, area')
        .eq('is_active', true)
        .order('price', { ascending: true }) // Order by price for better UX
        .range(from, to);

      if (!error && data) {
        const formattedProviders = data.map(service => {
          // Optimized rating calculation
          const rating = Math.min(5.0, 3.5 + (service.experience * 0.15));
          
          return {
            id: service.id,
            name: service.service_name,
            provider: service.provider_username,
            service: service.service_name,
            rating: parseFloat(rating.toFixed(1)),
            experience: service.experience,
            area: service.area,
            price: service.price,
            phone: service.phone
          };
        });

        // Cache with performance utilities
        CacheManager.set(cacheKey, formattedProviders, 180000); // 3 minutes

        if (isLoadMore) {
          setDisplayedProviders(prev => [...prev, ...formattedProviders]);
        } else {
          setDisplayedProviders(formattedProviders);
          setProviders(formattedProviders);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      // Minimal fallback for better performance
      if (!isLoadMore && displayedProviders.length === 0) {
        setDisplayedProviders([]);
      }
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  // Debounced search for better performance
  const debouncedSearch = debounce((query) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
    }
  }, 300);

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
        defaultValue={searchQuery}
        onChange={(e) => debouncedSearch(e.target.value)}
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
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}>
                        {provider.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }} noWrap>
                          {provider.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          by {provider.provider}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={provider.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                        {provider.rating} ({provider.experience}y exp)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }} noWrap>
                        {provider.area}, Vijayawada
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {provider.phone}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        ₹{provider.price}
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
                          px: 2,
                          py: 0.75,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: '0.85rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
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
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loadingMore ? 'Loading...' : `Load More (${displayedProviders.length} shown)`}
          </Button>
        </Box>
      )}
      
      {!loading && filteredProviders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No services found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchQuery('');
              fetchProviders(1, false);
            }}
            sx={{ borderRadius: 2 }}
          >
            Show All Services
          </Button>
        </Box>
      )}
    </>
  )}
    </Container>
  );
};

export default ServiceSearch;