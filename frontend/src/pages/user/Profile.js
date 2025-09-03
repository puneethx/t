import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from 'react-query';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { user, updateProfile } = useAuth();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      preferences: {
        travelStyle: user?.preferences?.travelStyle || 'adventure',
        interests: user?.preferences?.interests?.join(', ') || '',
      }
    }
  });

  const updateProfileMutation = useMutation(
    async (data) => {
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        preferences: {
          travelStyle: data.preferences.travelStyle,
          interests: data.preferences.interests.split(',').map(i => i.trim()).filter(i => i)
        }
      };
      return await updateProfile(profileData);
    },
    {
      onSuccess: (result) => {
        if (result.success) {
          setSuccess('Profile updated successfully!');
          setError('');
          setIsEditing(false);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(result.error);
          setSuccess('');
        }
      }
    }
  );

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        My Profile
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              mr: 3,
              bgcolor: 'primary.main',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user?.role}
            </Typography>
          </Box>
          <Button
            variant={isEditing ? "outlined" : "contained"}
            startIcon={isEditing ? <Cancel /> : <Edit />}
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    disabled={!isEditing}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    disabled={!isEditing}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.travelStyle"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Travel Style</InputLabel>
                    <Select {...field} label="Travel Style">
                      <MenuItem value="adventure">Adventure</MenuItem>
                      <MenuItem value="luxury">Luxury</MenuItem>
                      <MenuItem value="budget">Budget</MenuItem>
                      <MenuItem value="cultural">Cultural</MenuItem>
                      <MenuItem value="relaxation">Relaxation</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.interests"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Interests"
                    disabled={!isEditing}
                    placeholder="e.g., hiking, photography, food"
                    helperText="Separate interests with commas"
                  />
                )}
              />
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </form>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(user?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="body1">
                {user?.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
