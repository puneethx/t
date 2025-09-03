import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LocationOn,
  Favorite,
  FavoriteBorder,
  Share,
  CalendarToday,
  Language,
  AttachMoney,
  Add,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', location: '', activity: '' });
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: destination, isLoading, error } = useQuery(
    ['destination', id],
    async () => {
      const response = await axios.get(`/api/v1/destination-guides/${id}`);
      return response.data;
    }
  );

  const { data: favorites } = useQuery(
    ['favorites'],
    async () => {
      const response = await axios.get('/api/v1/favorites');
      return response.data.favorites;
    },
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        const favorited = data.some(fav => 
          fav.resourceId._id === id && fav.resourceType === 'destination-guide'
        );
        setIsFavorited(favorited);
      }
    }
  );

  const addFavoriteMutation = useMutation(
    async () => {
      await axios.post('/api/v1/favorites', {
        type: 'destination-guide',
        id: destination._id
      });
    },
    {
      onSuccess: () => {
        setIsFavorited(true);
        queryClient.invalidateQueries(['favorites']);
      }
    }
  );

  const removeFavoriteMutation = useMutation(
    async () => {
      const favorite = favorites.find(fav => 
        fav.resourceId._id === id && fav.resourceType === 'destination-guide'
      );
      if (favorite) {
        await axios.delete(`/api/v1/favorites/${favorite._id}`);
      }
    },
    {
      onSuccess: () => {
        setIsFavorited(false);
        queryClient.invalidateQueries(['favorites']);
      }
    }
  );

  const addReviewMutation = useMutation(
    async (reviewData) => {
      await axios.post('/api/v1/reviews', {
        resourceType: 'destination-guide',
        resourceId: destination._id,
        ...reviewData
      });
    },
    {
      onSuccess: () => {
        setReviewDialogOpen(false);
        setNewReview({ rating: 5, comment: '', location: '', activity: '' });
        queryClient.invalidateQueries(['destination', id]);
      }
    }
  );

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    addReviewMutation.mutate(newReview);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading destination details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load destination details'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {destination.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn color="action" />
            <Typography variant="h6" color="text.secondary">
              {destination.location.city}, {destination.location.country}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={destination.averageRating} readOnly precision={0.1} />
            <Typography variant="body2">
              ({destination.totalReviews} reviews)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
            onClick={handleToggleFavorite}
            disabled={addFavoriteMutation.isLoading || removeFavoriteMutation.isLoading}
          >
            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
          <IconButton color="primary">
            <Share />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {destination.tags?.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined" />
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Photos */}
          {destination.photos?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <img
                src={destination.photos[0].url}
                alt={destination.title}
                style={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>
          )}

          {/* Description */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                About {destination.title}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {destination.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Content Sections */}
          {destination.content && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {destination.content.history && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        History
                      </Typography>
                      <Typography variant="body2">
                        {destination.content.history}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {destination.content.culture && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Culture
                      </Typography>
                      <Typography variant="body2">
                        {destination.content.culture}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* Attractions */}
          {destination.content?.attractions?.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Top Attractions
                </Typography>
                <Grid container spacing={2}>
                  {destination.content.attractions.map((attraction, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body1">{attraction}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {destination.recommendations && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Recommendations
                </Typography>
                
                {/* Lodging */}
                {destination.recommendations.lodging?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Lodging
                    </Typography>
                    <Grid container spacing={2}>
                      {destination.recommendations.lodging.map((lodge, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {lodge.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {lodge.type} • {lodge.priceRange}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {lodge.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Dining */}
                {destination.recommendations.dining?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Dining
                    </Typography>
                    <Grid container spacing={2}>
                      {destination.recommendations.dining.map((restaurant, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {restaurant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {restaurant.cuisine} • {restaurant.priceRange}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {restaurant.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Activities */}
                {destination.recommendations.activities?.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Activities
                    </Typography>
                    <Grid container spacing={2}>
                      {destination.recommendations.activities.map((activity, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {activity.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.category} • {activity.difficulty} • {activity.duration}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {activity.description}
                            </Typography>
                            {activity.cost && (
                              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Cost: {activity.cost}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Reviews ({destination.totalReviews})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddReview}
                >
                  Add Review
                </Button>
              </Box>

              {destination.reviews?.length > 0 ? (
                destination.reviews.map((review) => (
                  <Box key={review._id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar>
                        {review.user.firstName[0]}{review.user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {review.user.firstName} {review.user.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 7 }}>
                      {review.comment}
                    </Typography>
                    {review.location && (
                      <Chip
                        label={`Location: ${review.location}`}
                        size="small"
                        sx={{ ml: 7, mt: 1, mr: 1 }}
                      />
                    )}
                    {review.activity && (
                      <Chip
                        label={`Activity: ${review.activity}`}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review this destination!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Quick Info
              </Typography>
              {destination.content && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {destination.content.bestTimeToVisit && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Best Time to Visit
                        </Typography>
                        <Typography variant="body2">
                          {destination.content.bestTimeToVisit}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {destination.content.language?.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Language color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Languages
                        </Typography>
                        <Typography variant="body2">
                          {destination.content.language.join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {destination.content.currency && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Currency
                        </Typography>
                        <Typography variant="body2">
                          {destination.content.currency}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Plan Your Trip
              </Typography>
              <Button
                fullWidth
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => navigate('/create-itinerary', { 
                  state: { destinationId: destination._id } 
                })}
              >
                Create Itinerary
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/groups')}
              >
                Find Travel Groups
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Your Review</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(event, newValue) => {
                  setNewReview({ ...newReview, rating: newValue });
                }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Location (optional)"
              value={newReview.location}
              onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
              placeholder="e.g., Ubud, Seminyak"
            />
            <TextField
              fullWidth
              label="Activity (optional)"
              value={newReview.activity}
              onChange={(e) => setNewReview({ ...newReview, activity: e.target.value })}
              placeholder="e.g., Temple visit, Beach day"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={!newReview.comment.trim() || addReviewMutation.isLoading}
          >
            {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DestinationDetail;
