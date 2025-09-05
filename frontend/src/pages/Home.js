import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search, Explore, Map, Group, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import SearchSuggestions from '../components/search/SearchSuggestions';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const { data: featuredDestinations } = useQuery(
    'featuredDestinations',
    async () => {
      const response = await axios.get('/api/v1/destination-guides?limit=6');
      return response.data.destinationGuides;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (destination) => {
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const features = [
    {
      icon: <Explore sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Curated Destination Guides',
      description: 'Discover amazing destinations with expert-crafted guides featuring local insights, attractions, and recommendations.',
    },
    {
      icon: <Map sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Custom Trip Itineraries',
      description: 'Create personalized travel itineraries tailored to your preferences, budget, and travel style.',
    },
    {
      icon: <Group sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Travel Communities',
      description: 'Connect with fellow adventurers, join travel groups, and share your experiences with like-minded travelers.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'visible',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                {user?.role === 'admin' 
                  ? `Welcome back, Admin ${user.firstName}!`
                  : user 
                    ? `Welcome back, ${user.firstName}!`
                    : 'Explore the World with TravelTrove'
                }
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                {user?.role === 'admin'
                  ? 'Manage destinations, users, and create amazing travel experiences for adventurers worldwide.'
                  : 'Professional grade travel planning and exploration platform designed for adventurers who want to discover the world in style.'
                }
              </Typography>

              {/* Popular Search Suggestions */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  Popular searches:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['beach destinations', 'cultural cities', 'adventure travel', 'romantic getaways', 'food destinations'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        navigate(`/destinations?search=${encodeURIComponent(suggestion)}`);
                      }}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Search Bar with Suggestions */}
              <Box sx={{ position: 'relative', maxWidth: 500, mb: 3, zIndex: 1000 }}>
                <Paper
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search destinations (e.g., 'beach destinations', 'mountain retreats')..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
                    onBlur={handleSearchInputBlur}
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
                
                {/* Search Suggestions */}
                {showSuggestions && (
                  <SearchSuggestions
                    searchQuery={searchQuery}
                    onSuggestionClick={handleSuggestionClick}
                    maxResults={5}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/destinations')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Explore Destinations
                </Button>
                {user && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/create-itinerary')}
                    sx={{
                      backgroundColor: 'secondary.main',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                  >
                    Create Itinerary
                  </Button>
                )}
                {user?.role === 'admin' && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/admin')}
                    sx={{
                      backgroundColor: 'warning.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'warning.dark',
                      },
                    }}
                  >
                    Admin Dashboard
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'center',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop"
                  alt="Travel Adventure"
                  style={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 0 }}>
        <Typography
          variant="h2"
          textAlign="center"
          sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          Why Choose TravelTrove?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Discover what makes our platform the perfect companion for your travel adventures
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Destinations */}
      {featuredDestinations && featuredDestinations.length > 0 && (
        <Box sx={{ bgcolor: 'background.default', py: 8, position: 'relative', zIndex: 0 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              Featured Destinations
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6 }}
            >
              Discover our most popular travel destinations
            </Typography>

            <Grid container spacing={4}>
              {featuredDestinations.slice(0, 6).map((destination) => (
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {destination.location.city}, {destination.location.country}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {destination.summary}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                        <Typography variant="body2">
                          {destination.averageRating?.toFixed(1) || 'New'} 
                          {destination.totalReviews > 0 && ` (${destination.totalReviews} reviews)`}
                        </Typography>
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

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/destinations')}
              >
                View All Destinations
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, position: 'relative', zIndex: 0 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Ready to Start Your Adventure?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of travelers who trust TravelTrove for their journey planning
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/destinations')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Explore First
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/create-itinerary')}
                sx={{
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                }}
              >
                Plan Your Next Trip
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
