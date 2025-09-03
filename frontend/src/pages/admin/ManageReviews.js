import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Rating,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Delete,
  Flag,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageReviews = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const queryClient = useQueryClient();

  const { data: reviews, isLoading, error } = useQuery(
    ['adminReviews', page, rowsPerPage],
    async () => {
      const response = await axios.get('/api/v1/admin/reviews', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      return response.data;
    }
  );

  const deleteReviewMutation = useMutation(
    async (reviewId) => {
      await axios.delete(`/api/v1/reviews/${reviewId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminReviews']);
        setDeleteDialogOpen(false);
        setSelectedReview(null);
      }
    }
  );

  const toggleReviewMutation = useMutation(
    async ({ reviewId, action }) => {
      await axios.patch(`/api/v1/admin/reviews/${reviewId}`, { action });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminReviews']);
        handleMenuClose();
      }
    }
  );

  const handleMenuClick = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleToggleVisibility = (action) => {
    if (selectedReview) {
      toggleReviewMutation.mutate({
        reviewId: selectedReview._id,
        action
      });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview._id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading reviews..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load reviews'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          Manage Reviews
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Moderate user reviews and ratings
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews?.reviews?.map((review) => (
              <TableRow key={review._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {review.user.firstName[0]}{review.user.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {review.user.firstName} {review.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {review.resourceType === 'DestinationGuide' 
                        ? review.destinationGuide?.title 
                        : review.tripItinerary?.title}
                    </Typography>
                    <Chip
                      label={review.resourceType === 'DestinationGuide' ? 'Destination' : 'Itinerary'}
                      size="small"
                      color={review.resourceType === 'DestinationGuide' ? 'primary' : 'secondary'}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {review.comment || 'No comment'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={review.isActive ? 'Visible' : 'Hidden'}
                    color={review.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, review)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reviews?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewReview(selectedReview)}>
          <Visibility sx={{ mr: 1 }} />
          View Full Review
        </MenuItem>
        {selectedReview?.isActive ? (
          <MenuItem onClick={() => handleToggleVisibility('hide')}>
            <Flag sx={{ mr: 1 }} />
            Hide Review
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleToggleVisibility('show')}>
            <CheckCircle sx={{ mr: 1 }} />
            Show Review
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteClick(selectedReview)}>
          <Delete sx={{ mr: 1 }} />
          Delete Review
        </MenuItem>
      </Menu>

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedReview.user.firstName} {selectedReview.user.lastName} ({selectedReview.user.email})
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Resource
                </Typography>
                <Typography variant="body1">
                  {selectedReview.resourceType === 'DestinationGuide' 
                    ? selectedReview.destinationGuide?.title 
                    : selectedReview.tripItinerary?.title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating
                </Typography>
                <Rating value={selectedReview.rating} readOnly />
              </Box>
              {selectedReview.comment && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comment
                  </Typography>
                  <Typography variant="body1">
                    {selectedReview.comment}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(selectedReview.createdAt), 'MMMM dd, yyyy • h:mm a')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteReviewMutation.isLoading}
          >
            {deleteReviewMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageReviews;
