import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  LocationOn,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageDestinations = () => {
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: destinations, isLoading, error } = useQuery(
    ['adminDestinations', page],
    async () => {
      const response = await axios.get('/api/v1/destinations', {
        params: { page, limit: 12 }
      });
      return response.data;
    }
  );

  const toggleVisibilityMutation = useMutation(
    async ({ id, isActive }) => {
      await axios.patch(`/api/v1/admin/destinations/${id}`, {
        action: isActive ? 'deactivate' : 'activate'
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminDestinations']);
      }
    }
  );

  const deleteDestinationMutation = useMutation(
    async (id) => {
      await axios.delete(`/api/v1/destinations/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminDestinations']);
        setDeleteDialogOpen(false);
        setSelectedDestination(null);
      }
    }
  );

  const handleToggleVisibility = (destination) => {
    toggleVisibilityMutation.mutate({
      id: destination._id,
      isActive: destination.isActive
    });
  };

  const handleDeleteClick = (destination) => {
    setSelectedDestination(destination);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDestination) {
      deleteDestinationMutation.mutate(selectedDestination._id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading destinations..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load destinations'}
        </Alert>
      </Container>
    );
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
            Manage Destinations
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Create, edit, and manage destination guides
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/destinations/create')}
        >
          Add Destination
        </Button>
      </Box>

      {destinations?.destinations?.length === 0 ? (
        <Alert severity="info">
          No destinations found. Create the first destination guide!
        </Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {destinations?.destinations?.map((destination) => (
              <Grid item xs={12} sm={6} md={4} key={destination._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: destination.isActive ? 1 : 0.6,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={destination.photos?.[0] || '/api/placeholder/400/200'}
                    alt={destination.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        {destination.title}
                      </Typography>
                      <Chip
                        label={destination.isActive ? 'Active' : 'Hidden'}
                        color={destination.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {destination.location.city}, {destination.location.country}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <Star sx={{ fontSize: 16, color: 'gold' }} />
                      <Typography variant="body2">
                        {destination.averageRating?.toFixed(1) || 'No ratings'} 
                        {destination.totalReviews > 0 && ` (${destination.totalReviews} reviews)`}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {destination.summary}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/admin/destinations/${destination._id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={destination.isActive ? <VisibilityOff /> : <Visibility />}
                      onClick={() => handleToggleVisibility(destination)}
                      disabled={toggleVisibilityMutation.isLoading}
                    >
                      {destination.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(destination)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil((destinations?.total || 0) / 12)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Destination</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedDestination?.title}</strong>?
            This action cannot be undone and will also delete all associated reviews and favorites.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteDestinationMutation.isLoading}
          >
            {deleteDestinationMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageDestinations;
