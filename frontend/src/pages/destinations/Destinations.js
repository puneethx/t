import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Pagination,
  InputAdornment,
  Chip,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  Divider,
  Skeleton
} from '@mui/material';
import { Search, Star, LocationOn, FilterList, Close } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    budgetRange: '',
    travelStyle: '',
    tags: []
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, error, isFetching } = useQuery(
    ['destinations', searchQuery, page, filters],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (filters.budgetRange) {
        params.append('budgetRange', filters.budgetRange);
      }
      
      if (filters.travelStyle) {
        params.append('travelStyle', filters.travelStyle);
      }
      
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      
      const response = await axios.get(`/api/v1/destination-guides?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  }, [searchQuery, page, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      budgetRange: '',
      travelStyle: '',
      tags: []
    });
    setPage(1);
  };

  const renderFilterDrawer = () => (
    <Drawer
      anchor="left"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 300,
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Budget Range</InputLabel>
        <Select
          value={filters.budgetRange}
          label="Budget Range"
          onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
        >
          <MenuItem value="">Any Budget</MenuItem>
          <MenuItem value="budget">Budget ($)</MenuItem>
          <MenuItem value="mid-range">Mid-range ($$)</MenuItem>
          <MenuItem value="luxury">Luxury ($$$)</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Travel Style</InputLabel>
        <Select
          value={filters.travelStyle}
          label="Travel Style"
          onChange={(e) => handleFilterChange('travelStyle', e.target.value)}
        >
          <MenuItem value="">Any Style</MenuItem>
          <MenuItem value="adventure">Adventure</MenuItem>
          <MenuItem value="cultural">Cultural</MenuItem>
          <MenuItem value="relaxation">Relaxation</MenuItem>
          <MenuItem value="family">Family</MenuItem>
          <MenuItem value="romantic">Romantic</MenuItem>
          <MenuItem value="business">Business</MenuItem>
        </Select>
      </FormControl>
      
      <Button
        variant="outlined"
        fullWidth
        onClick={clearFilters}
        sx={{ mt: 2 }}
      >
        Clear All Filters
      </Button>
    </Drawer>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading destinations..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
      >
        Destination Guides
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing destinations with expert-crafted guides
      </Typography>

      {/* Search Bar and Filter Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-start' }}>
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 600,
            flex: 1
          }}
        >
          <TextField
            fullWidth
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { border: 'none', '& fieldset': { border: 'none' } },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ ml: 1, px: 3 }}
          >
            Search
          </Button>
        </Paper>
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{ height: 56, px: 3 }}
        >
          Filters
        </Button>
      </Box>
      
      {renderFilterDrawer()}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error.response?.data?.error || 'Failed to load destinations'}
        </Alert>
      )}

      {data?.destinationGuides?.length === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No destination guides found. Try adjusting your search terms or browse all destinations.
        </Alert>
      )}

      {/* Results */}
      {data?.destinationGuides && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {data.pagination.totalResults} destinations found
            </Typography>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Grid container spacing={3}>
            {isFetching && !isLoading ? (
              // Show skeleton loading for cards while fetching new data
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 1 }} />
                      <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 1 }} />
                      <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 2 }} />
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              data.destinationGuides.map((destination) => (
                <Grid item xs={12} sm={6} md={4} key={destination._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        destination.photos?.[0]?.url ||
                        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop'
                      }
                      alt={destination.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {destination.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {destination.location.city}, {destination.location.country}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {destination.summary}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                        <Typography variant="body2">
                          {destination.averageRating > 0 
                            ? `${destination.averageRating.toFixed(1)} (${destination.totalReviews} reviews)`
                            : 'No reviews yet'
                          }
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {destination.tags?.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/destinations/${destination._id}`)}
                      >
                        Learn More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={data.pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Destinations;
