import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  CalendarToday,
  Group,
  AttachMoney,
  Save,
  Login,
  Share,
  Edit,
  Delete
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useMutation } from 'react-query';
import { guestStorage } from '../../utils/guestStorage';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/api';

const GuestItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const guestItinerary = guestStorage.getItinerary(id);
    if (guestItinerary) {
      setItinerary(guestItinerary);
    } else {
      setError('Itinerary not found');
    }
  }, [id]);

  const saveItineraryMutation = useMutation(
    async (itineraryData) => {
      // Remove guest-specific properties
      const { id, isGuest, createdAt, ...cleanData } = itineraryData;
      const response = await axios.post('/api/v1/trip-itineraries', cleanData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Remove from guest storage
        guestStorage.removeItinerary(id);
        // Navigate to the saved itinerary
        navigate(`/itineraries/${data.itinerary._id}`);
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Failed to save itinerary');
      }
    }
  );

  const handleSaveItinerary = () => {
    if (isAuthenticated) {
      saveItineraryMutation.mutate(itinerary);
    } else {
      setSaveDialogOpen(true);
    }
  };

  const handleEditItinerary = () => {
    if (isAuthenticated) {
      navigate('/itineraries/create', { 
        state: { 
          editMode: true, 
          guestItinerary: itinerary 
        } 
      });
    } else {
      // Store the itinerary data in session storage for after login
      sessionStorage.setItem('pendingEditItinerary', JSON.stringify(itinerary));
      navigate('/login', { state: { redirectTo: '/itineraries/create' } });
    }
  };

  const handleDeleteItinerary = () => {
    if (itinerary.isDraft) {
      // Delete draft from session storage
      guestStorage.removeDraftItinerary(itinerary.id);
    } else {
      // Delete guest itinerary from localStorage
      guestStorage.removeItinerary(itinerary.id);
    }
    navigate('/itineraries');
  };

  const handleLoginToSave = () => {
    // Store the current itinerary ID in session storage for after login
    sessionStorage.setItem('pendingSaveItinerary', id);
    navigate('/login');
  };

  if (error && !itinerary) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/itineraries')} sx={{ mt: 2 }}>
          Back to Itineraries
        </Button>
      </Container>
    );
  }

  if (!itinerary) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with action buttons */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {itinerary.title}
          </Typography>
          <Chip 
            label="Guest Itinerary" 
            color="warning" 
            size="small" 
            sx={{ mb: 2 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveItinerary}
            disabled={saveItineraryMutation.isLoading}
          >
            {saveItineraryMutation.isLoading ? 'Saving...' : 'Save Itinerary'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditItinerary}
          >
            Edit
          </Button>
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete Itinerary"
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Itinerary Details */}
      <Paper sx={{ p: 4, mb: 3 }}>
        {itinerary.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {itinerary.description}
          </Typography>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {itinerary.duration?.days || 'N/A'} days
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Group sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Group Size
                </Typography>
                <Typography variant="body1">
                  {itinerary.groupSize || 1} {itinerary.groupSize === 1 ? 'person' : 'people'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {itinerary.startDate ? format(new Date(itinerary.startDate), 'MMM dd, yyyy') : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Budget
                </Typography>
                <Typography variant="body1">
                  ₹{itinerary.budget?.total || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {itinerary.travelStyle && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Travel Style
            </Typography>
            <Chip 
              label={itinerary.travelStyle.charAt(0).toUpperCase() + itinerary.travelStyle.slice(1)} 
              variant="outlined" 
            />
          </Box>
        )}
      </Paper>

      {/* Daily Plan */}
      {itinerary.dailyPlan && itinerary.dailyPlan.length > 0 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Daily Plan
          </Typography>
          
          {itinerary.dailyPlan.map((day, index) => (
            <Card key={index} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Day {day.day}
                </Typography>
                
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((activity, actIndex) => (
                    <Box key={actIndex} sx={{ mb: 2, pl: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {activity.time && (
                          <Typography variant="body2" color="primary.main" sx={{ minWidth: '60px', fontWeight: 'bold' }}>
                            {activity.time}
                          </Typography>
                        )}
                        <Box sx={{ flex: 1 }}>
                          {activity.activity && (
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {activity.activity}
                            </Typography>
                          )}
                          {activity.location && (
                            <Typography variant="body2" color="text.secondary">
                              📍 {activity.location}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {actIndex < day.activities.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No activities planned for this day
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}

      {/* Save Dialog for non-authenticated users */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Your Itinerary</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            To save this itinerary permanently and access it from any device, you need to create an account or log in.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your itinerary will be saved to your account and you can edit, share, and manage it anytime.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Login />}
            onClick={handleLoginToSave}
          >
            Login to Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Itinerary</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete "{itinerary?.title}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the itinerary from your local storage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteItinerary}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GuestItineraryDetail;
