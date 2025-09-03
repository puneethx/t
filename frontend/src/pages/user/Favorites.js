import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete, Star, LocationOn, CalendarToday, Group } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Favorites = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading, error } = useQuery(
    ['favorites'],
    async () => {
      const response = await axios.get('/api/v1/favorites');
      return response.data.favorites;
    }
  );

  const removeFavoriteMutation = useMutation(
    async (favoriteId) => {
      await axios.delete(`/api/v1/favorites/${favoriteId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites']);
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRemoveFavorite = (favoriteId) => {
    removeFavoriteMutation.mutate(favoriteId);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  const destinationFavorites = favorites?.filter(fav => fav.resourceType === 'destination-guide') || [];
  const itineraryFavorites = favorites?.filter(fav => fav.resourceType === 'trip-itinerary') || [];

  const currentFavorites = tabValue === 0 ? destinationFavorites : itineraryFavorites;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}
      >
        My Favorites
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your saved destinations and itineraries
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error.response?.data?.error || 'Failed to load favorites'}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Destinations (${destinationFavorites.length})`} />
          <Tab label={`Itineraries (${itineraryFavorites.length})`} />
        </Tabs>
      </Box>

      {currentFavorites.length === 0 ? (
        <Alert severity="info">
          No {tabValue === 0 ? 'destination' : 'itinerary'} favorites yet. 
          Start exploring and save your favorite {tabValue === 0 ? 'destinations' : 'itineraries'}!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {currentFavorites.map((favorite) => (
            <Grid item xs={12} sm={6} md={4} key={favorite._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,1)',
                    },
                  }}
                  onClick={() => handleRemoveFavorite(favorite._id)}
                  disabled={removeFavoriteMutation.isLoading}
                >
                  <Delete color="error" />
                </IconButton>

                {tabValue === 0 && favorite.resourceId.photos?.[0]?.url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={favorite.resourceId.photos[0].url}
                    alt={favorite.resourceId.title}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {favorite.resourceId.title}
                  </Typography>

                  {tabValue === 0 ? (
                    // Destination favorite
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {favorite.resourceId.location?.city}, {favorite.resourceId.location?.country}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {favorite.resourceId.summary}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                        <Typography variant="body2">
                          {favorite.resourceId.averageRating > 0 
                            ? `${favorite.resourceId.averageRating.toFixed(1)} (${favorite.resourceId.totalReviews} reviews)`
                            : 'No reviews yet'
                          }
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    // Itinerary favorite
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {favorite.resourceId.duration?.days} days
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {favorite.resourceId.groupSize} people
                          </Typography>
                        </Box>
                      </Box>
                      {favorite.resourceId.startDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Starts: {format(new Date(favorite.resourceId.startDate), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                        <Typography variant="body2">
                          {favorite.resourceId.averageRating > 0 
                            ? `${favorite.resourceId.averageRating.toFixed(1)} (${favorite.resourceId.totalReviews} reviews)`
                            : 'No reviews yet'
                          }
                        </Typography>
                      </Box>
                    </>
                  )}

                  {favorite.notes && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{favorite.notes}"
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Saved on {format(new Date(favorite.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => 
                      navigate(
                        tabValue === 0 
                          ? `/destinations/${favorite.resourceId._id}`
                          : `/itineraries/${favorite.resourceId._id}`
                      )
                    }
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites;
