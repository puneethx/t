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
} from '@mui/material';
import { Search, Star, LocationOn } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['destinations', searchQuery, page],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
        const response = await axios.get(`/api/v1/destination-guides/search?${params}`);
        return response.data;
      } else {
        const response = await axios.get(`/api/v1/destination-guides?${params}`);
        return response.data;
      }
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

      {/* Search Bar */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          maxWidth: 600,
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
            {data.destinationGuides.map((destination) => (
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
            ))}
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
