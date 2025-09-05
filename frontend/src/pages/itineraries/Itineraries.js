import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Pagination,
  Chip,
  Alert,
  Fab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add, CalendarToday, Group, Star, LocationOn, Person, Delete, Edit } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { guestStorage } from '../../utils/guestStorage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Itineraries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [guestItineraries, setGuestItineraries] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load guest itineraries from localStorage and draft itineraries from session storage
  useEffect(() => {
    const stored = guestStorage.getItineraries();
    const drafts = guestStorage.getDraftItineraries();
    setGuestItineraries([...stored, ...drafts]);
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (itinerary) => {
    setItineraryToDelete(itinerary);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (itineraryToDelete) {
      if (itineraryToDelete.isDraft) {
        // Delete draft from session storage
        guestStorage.removeDraftItinerary(itineraryToDelete.id);
      } else {
        // Delete guest itinerary from localStorage
        guestStorage.removeItinerary(itineraryToDelete.id);
      }
      
      // Update the local state
      setGuestItineraries(prev => prev.filter(item => item.id !== itineraryToDelete.id));
    }
    setDeleteDialogOpen(false);
    setItineraryToDelete(null);
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItineraryToDelete(null);
  };

  // Handle edit click - redirect to login if not authenticated
  const handleEditClick = (itinerary) => {
    if (!isAuthenticated) {
      // Store the itinerary ID in session storage for after login
      sessionStorage.setItem('pendingEditItinerary', JSON.stringify(itinerary));
      navigate('/login', { state: { redirectTo: '/itineraries/create' } });
    } else {
      navigate('/itineraries/create', { 
        state: { 
          editMode: true, 
          guestItinerary: itinerary 
        } 
      });
    }
  };

  const { data, isLoading, error } = useQuery(
    ['itineraries', page],
    async () => {
      const response = await axios.get(`/api/v1/trip-itineraries?page=${page}&limit=12`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading itineraries..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Trip Itineraries
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover and create custom travel itineraries
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-itinerary')}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Create Itinerary
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error.response?.data?.error || 'Failed to load itineraries'}
        </Alert>
      )}

      {data?.itineraries?.length === 0 && guestItineraries.length === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No itineraries found. Create your first itinerary!
        </Alert>
      )}

      {/* Guest Itineraries Section */}
      {guestItineraries.length > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              Your Draft & Guest Itineraries
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drafts are saved in your session and guest itineraries are stored locally. Login to save them permanently.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {guestItineraries.map((itinerary) => (
              <Grid item xs={12} sm={6} md={4} key={itinerary.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    border: '2px solid',
                    borderColor: 'warning.light',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {itinerary.title}
                      </Typography>
                      <Chip label="Draft" color="warning" size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.duration?.days || 'N/A'} days
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.groupSize || 1} {(itinerary.groupSize || 1) === 1 ? 'person' : 'people'}
                        </Typography>
                      </Box>
                    </Box>

                    {itinerary.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {itinerary.description.length > 100 
                          ? `${itinerary.description.substring(0, 100)}...`
                          : itinerary.description
                        }
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {itinerary.travelStyle && (
                        <Chip
                          label={itinerary.travelStyle}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      )}
                      {itinerary.budget?.total && (
                        <Chip
                          label={`₹${itinerary.budget.total}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(itinerary.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/itineraries/guest/${itinerary.id}`)}
                    >
                      View Details
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(itinerary)}
                        color="primary"
                        title="Edit Itinerary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(itinerary)}
                        color="error"
                        title="Delete Itinerary"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 4 }} />
        </>
      )}

      {/* Regular Itineraries Results */}
      {data?.itineraries && (
        <>
          {guestItineraries.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Public Itineraries
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {data.pagination.totalResults} public itineraries found
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {data.itineraries.map((itinerary) => (
              <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {itinerary.title}
                    </Typography>
                    
                    {itinerary.destination && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.destination.location.city}, {itinerary.destination.location.country}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.duration.days} days, {itinerary.duration.nights} nights
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.groupSize} {itinerary.groupSize === 1 ? 'person' : 'people'}
                        </Typography>
                      </Box>
                    </Box>

                    {itinerary.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {itinerary.description.length > 150 
                          ? `${itinerary.description.substring(0, 150)}...`
                          : itinerary.description
                        }
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                      <Typography variant="body2">
                        {itinerary.averageRating > 0 
                          ? `${itinerary.averageRating.toFixed(1)} (${itinerary.totalReviews} reviews)`
                          : 'No reviews yet'
                        }
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      <Chip
                        label={itinerary.travelStyle}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {itinerary.budget?.total && (
                        <Chip
                          label={`$${itinerary.budget.total}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      By {itinerary.createdBy.firstName} {itinerary.createdBy.lastName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/itineraries/${itinerary._id}`)}
                    >
                      View Details
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

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="create itinerary"
        onClick={() => navigate('/create-itinerary')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <Add />
      </Fab>
          {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Itinerary
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{itineraryToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Itineraries;
