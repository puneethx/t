import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import { Add, Group, Public, Lock, Person, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Groups = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      maxMembers: 10,
    }
  });

  const { data: publicGroups, isLoading: loadingPublic } = useQuery(
    'publicGroups',
    async () => {
      const response = await axios.get('/api/v1/groups/public');
      return response.data.groups;
    }
  );

  const { data: myGroups, isLoading: loadingMy } = useQuery(
    'myGroups',
    async () => {
      const response = await axios.get('/api/v1/groups/my-groups');
      return response.data.groups;
    }
  );

  const createGroupMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/v1/groups', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setCreateDialogOpen(false);
        reset();
        queryClient.invalidateQueries(['myGroups']);
        navigate(`/groups/${data.group._id}`);
      }
    }
  );

  const joinGroupMutation = useMutation(
    async ({ groupId, inviteCode }) => {
      const response = await axios.post(`/api/v1/groups/${groupId}/join`, {
        inviteCode: inviteCode || undefined
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myGroups']);
        queryClient.invalidateQueries(['publicGroups']);
        setJoinDialogOpen(false);
        setInviteCode('');
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateGroup = (data) => {
    createGroupMutation.mutate(data);
  };

  const handleJoinGroup = (groupId, isPublic = true) => {
    if (isPublic) {
      joinGroupMutation.mutate({ groupId });
    } else {
      setJoinDialogOpen(true);
    }
  };

  const isLoading = loadingPublic || loadingMy;

  if (isLoading) {
    return <LoadingSpinner message="Loading travel groups..." />;
  }

  const currentGroups = tabValue === 0 ? publicGroups : myGroups;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Travel Groups
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Connect with fellow adventurers and plan trips together
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Create Group
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Public Groups (${publicGroups?.length || 0})`} />
          <Tab label={`My Groups (${myGroups?.length || 0})`} />
        </Tabs>
      </Box>

      {currentGroups?.length === 0 ? (
        <Alert severity="info">
          {tabValue === 0 
            ? 'No public groups available. Create the first one!'
            : 'You haven\'t joined any groups yet. Browse public groups or create your own!'
          }
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {currentGroups?.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      {group.name}
                    </Typography>
                    {group.isPublic ? (
                      <Public color="success" fontSize="small" />
                    ) : (
                      <Lock color="action" fontSize="small" />
                    )}
                  </Box>

                  {group.description && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.members?.length || 0} / {group.maxMembers} members
                    </Typography>
                  </Box>

                  {group.destination && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {group.destination.title}
                      </Typography>
                    </Box>
                  )}

                  {group.members && group.members.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Members:
                      </Typography>
                      <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                        {group.members.map((member) => (
                          <Avatar key={member.user._id} sx={{ width: 32, height: 32 }}>
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Created by {group.creator.firstName} {group.creator.lastName}
                  </Typography>
                </CardContent>

                <CardActions>
                  {tabValue === 0 ? (
                    <Button
                      size="small"
                      onClick={() => handleJoinGroup(group._id, group.isPublic)}
                      disabled={joinGroupMutation.isLoading}
                    >
                      {group.isPublic ? 'Join Group' : 'Request to Join'}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => navigate(`/groups/${group._id}`)}
                    >
                      View Group
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="create group"
        onClick={() => setCreateDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <Add />
      </Fab>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Travel Group</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateGroup)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Group name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Group Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Description (optional)"
                  />
                )}
              />
              <Controller
                name="maxMembers"
                control={control}
                rules={{ required: 'Max members is required', min: 2 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Maximum Members"
                    inputProps={{ min: 2, max: 100 }}
                    error={!!errors.maxMembers}
                    helperText={errors.maxMembers?.message}
                  />
                )}
              />
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Public Group (anyone can join)"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createGroupMutation.isLoading}
            >
              {createGroupMutation.isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Join Private Group Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Private Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This is a private group. Please enter the invitation code to join.
          </Typography>
          <TextField
            fullWidth
            label="Invitation Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => joinGroupMutation.mutate({ groupId: 'current', inviteCode })}
            disabled={!inviteCode.trim() || joinGroupMutation.isLoading}
          >
            {joinGroupMutation.isLoading ? 'Joining...' : 'Join Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Groups;
