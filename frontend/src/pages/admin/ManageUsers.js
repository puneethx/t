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
  TextField,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  MoreVert,
  Block,
  CheckCircle,
  AdminPanelSettings,
  Person,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageUsers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery(
    ['users', page, rowsPerPage],
    async () => {
      const response = await axios.get('/api/v1/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      return response.data;
    }
  );

  const userActionMutation = useMutation(
    async ({ userId, action }) => {
      const response = await axios.patch(`/api/v1/admin/users/${userId}`, { action });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        setActionDialogOpen(false);
        setSelectedUser(null);
        setActionType('');
      }
    }
  );

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setActionDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmAction = () => {
    if (selectedUser && actionType) {
      userActionMutation.mutate({
        userId: selectedUser._id,
        action: actionType,
      });
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
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load users'}
        </Alert>
      </Container>
    );
  }

  const getActionText = (action) => {
    switch (action) {
      case 'activate': return 'Activate User';
      case 'deactivate': return 'Deactivate User';
      case 'makeAdmin': return 'Make Admin';
      case 'removeAdmin': return 'Remove Admin';
      default: return 'Confirm Action';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          Manage Users
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View and manage user accounts
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.users?.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                    icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                    icon={user.isActive ? <CheckCircle /> : <Block />}
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, user)}
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
          count={users?.total || 0}
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
        {selectedUser?.isActive ? (
          <MenuItem onClick={() => handleActionClick('deactivate')}>
            <Block sx={{ mr: 1 }} />
            Deactivate User
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleActionClick('activate')}>
            <CheckCircle sx={{ mr: 1 }} />
            Activate User
          </MenuItem>
        )}
        {selectedUser?.role === 'admin' ? (
          <MenuItem onClick={() => handleActionClick('removeAdmin')}>
            <Person sx={{ mr: 1 }} />
            Remove Admin
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleActionClick('makeAdmin')}>
            <AdminPanelSettings sx={{ mr: 1 }} />
            Make Admin
          </MenuItem>
        )}
      </Menu>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>{getActionText(actionType)}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType.replace(/([A-Z])/g, ' $1').toLowerCase()} user{' '}
            <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType.includes('deactivate') ? 'error' : 'primary'}
            disabled={userActionMutation.isLoading}
          >
            {userActionMutation.isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;
