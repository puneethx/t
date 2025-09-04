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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  LocationOn,
  Favorite,
  FavoriteBorder,
  Share,
  CalendarToday,
  Group,
  AttachMoney,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', location: '', activity: '' });
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: itinerary, isLoading, error } = useQuery(
    ['itinerary', id],
    async () => {
      const response = await axios.get(`/api/v1/trip-itineraries/${id}`);
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
          fav.resourceId._id === id && fav.resourceType === 'trip-itinerary'
        );
        setIsFavorited(favorited);
      }
    }
  );

  const addFavoriteMutation = useMutation(
    async () => {
      await axios.post('/api/v1/favorites', {
        type: 'trip-itinerary',
        id: itinerary._id
      });
    },
    {
      onSuccess: () => {
        setIsFavorited(true);
        queryClient.invalidateQueries(['favorites']);
      },
      onError: (error) => {
        console.error('Error adding favorite:', error);
        if (error.response?.status === 400 && error.response?.data?.error === 'Item already in favorites') {
          setIsFavorited(true);
        }
      }
    }
  );

  const removeFavoriteMutation = useMutation(
    async () => {
      // First try to find the favorite in the current favorites data
      let favorite = favorites?.find(fav => 
        fav.resourceId._id === id && fav.resourceType === 'trip-itinerary'
      );
      
      // If not found in current data, fetch fresh favorites
      if (!favorite) {
        const response = await axios.get('/api/v1/favorites');
        const freshFavorites = response.data.favorites;
        favorite = freshFavorites.find(fav => 
          fav.resourceId._id === id && fav.resourceType === 'trip-itinerary'
        );
      }
      
      if (favorite) {
        await axios.delete(`/api/v1/favorites/${favorite._id}`);
      } else {
        throw new Error('Favorite not found');
      }
    },
    {
      onSuccess: () => {
        setIsFavorited(false);
        queryClient.invalidateQueries(['favorites']);
      },
      onError: (error) => {
        console.error('Error removing favorite:', error);
      }
    }
  );

  const addReviewMutation = useMutation(
    async (reviewData) => {
      await axios.post('/api/v1/reviews', {
        resourceType: 'trip-itinerary',
        resourceId: itinerary._id,
        ...reviewData
      });
    },
    {
      onSuccess: () => {
        setReviewDialogOpen(false);
        setNewReview({ rating: 5, comment: '', location: '', activity: '' });
        queryClient.invalidateQueries(['itinerary', id]);
      }
    }
  );

  const deleteItineraryMutation = useMutation(
    async () => {
      await axios.delete(`/api/v1/trip-itineraries/${id}`);
    },
    {
      onSuccess: () => {
        navigate('/itineraries');
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

  const canEdit = user && (user._id === itinerary?.createdBy._id || user.role === 'admin');

  if (isLoading) {
    return <LoadingSpinner message="Loading itinerary details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load itinerary details'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {itinerary.title}
        </Typography>
        
        {itinerary.destination && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <LocationOn color="action" />
            <Typography variant="h6" color="text.secondary">
              {itinerary.destination.location.city}, {itinerary.destination.location.country}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={itinerary.averageRating} readOnly precision={0.1} />
            <Typography variant="body2">
              ({itinerary.totalReviews} reviews)
            </Typography>
          </Box>
          <Chip
            label={itinerary.isPublic ? 'Public' : 'Private'}
            color={itinerary.isPublic ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
            onClick={handleToggleFavorite}
            disabled={addFavoriteMutation.isLoading || removeFavoriteMutation.isLoading}
          >
            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/itineraries/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => deleteItineraryMutation.mutate()}
                disabled={deleteItineraryMutation.isLoading}
              >
                Delete
              </Button>
            </>
          )}
          <IconButton 
            color="primary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: itinerary.title,
                  text: `Check out this amazing trip itinerary: ${itinerary.title}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
          >
            <Share />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {itinerary.tags?.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined" />
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          {itinerary.description && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  About This Trip
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {itinerary.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Daily Plan */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Daily Itinerary
              </Typography>
              
              {itinerary.dailyPlan?.length > 0 ? (
                <Timeline>
                  {itinerary.dailyPlan.map((day, index) => (
                    <TimelineItem key={day.day}>
                      <TimelineSeparator>
                        <TimelineDot 
                          color="primary" 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {day.day}
                        </TimelineDot>
                        {index < itinerary.dailyPlan.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Day {day.day}
                        </Typography>
                        {day.activities?.map((activity, actIndex) => (
                          <Box key={actIndex} sx={{ mb: 1 }}>
                            <Typography variant="body1">
                              <strong>{activity.time}</strong> - {activity.activity}
                              {activity.location && ` at ${activity.location}`}
                            </Typography>
                          </Box>
                        ))}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No daily plan details available.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Reviews ({itinerary.totalReviews})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddReview}
                >
                  Add Review
                </Button>
              </Box>

              {itinerary.reviews?.length > 0 ? (
                itinerary.reviews.map((review) => (
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
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review this itinerary!
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
                Trip Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {itinerary.duration.days} days, {itinerary.duration.nights} nights
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Dates
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(itinerary.startDate), 'MMM dd, yyyy')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Group Size
                    </Typography>
                    <Typography variant="body2">
                      {itinerary.groupSize} {itinerary.groupSize === 1 ? 'person' : 'people'}
                    </Typography>
                  </Box>
                </Box>
                {itinerary.budget?.total && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney color="action" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Budget
                      </Typography>
                      <Typography variant="body2">
                        ₹{itinerary.budget.total}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Travel Style
                  </Typography>
                  <Chip
                    label={itinerary.travelStyle}
                    size="small"
                    sx={{ textTransform: 'capitalize', mt: 0.5 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Created By
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {itinerary.createdBy.firstName[0]}{itinerary.createdBy.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {itinerary.createdBy.firstName} {itinerary.createdBy.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created on {format(new Date(itinerary.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {itinerary.destination && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Destination Guide
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/destinations/${itinerary.destination._id}`)}
                >
                  View {itinerary.destination.title} Guide
                </Button>
              </CardContent>
            </Card>
          )}
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

export default ItineraryDetail;
