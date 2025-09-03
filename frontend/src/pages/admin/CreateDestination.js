import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { Add, Remove, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import axios from '../../utils/api';

const CreateDestination = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      location: {
        city: '',
        country: '',
        continent: '',
        coordinates: { lat: '', lng: '' }
      },
      photos: [''],
      content: {
        history: '',
        culture: '',
        attractions: [''],
        cuisine: '',
        transportation: '',
        accommodation: ''
      },
      recommendations: {
        bestTimeToVisit: '',
        duration: '',
        budget: '',
        activities: ['']
      },
      tags: [''],
      difficulty: 'easy'
    }
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: 'photos'
  });

  const { fields: attractionFields, append: appendAttraction, remove: removeAttraction } = useFieldArray({
    control,
    name: 'content.attractions'
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control,
    name: 'recommendations.activities'
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });

  const createDestinationMutation = useMutation(
    async (data) => {
      // Clean up empty fields
      const cleanData = {
        ...data,
        photos: data.photos.filter(photo => photo.trim()),
        content: {
          ...data.content,
          attractions: data.content.attractions.filter(attr => attr.trim())
        },
        recommendations: {
          ...data.recommendations,
          activities: data.recommendations.activities.filter(act => act.trim())
        },
        tags: data.tags.filter(tag => tag.trim()),
        location: {
          ...data.location,
          coordinates: {
            lat: parseFloat(data.location.coordinates.lat) || 0,
            lng: parseFloat(data.location.coordinates.lng) || 0
          }
        }
      };

      const response = await axios.post('/api/v1/destinations', cleanData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        navigate(`/destinations/${data.destination._id}`);
      },
      onError: (error) => {
        setSubmitError(error.response?.data?.error || 'Failed to create destination');
      }
    }
  );

  const onSubmit = (data) => {
    setSubmitError('');
    createDestinationMutation.mutate(data);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/destinations')}
          sx={{ mb: 2 }}
        >
          Back to Destinations
        </Button>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          Create New Destination
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Add a new travel destination guide
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Destination Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select {...field} label="Difficulty Level">
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="challenging">Challenging</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="summary"
                control={control}
                rules={{ required: 'Summary is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Summary"
                    multiline
                    rows={2}
                    error={!!errors.summary}
                    helperText={errors.summary?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Detailed Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Location Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="location.city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="City"
                    error={!!errors.location?.city}
                    helperText={errors.location?.city?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="location.country"
                control={control}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Country"
                    error={!!errors.location?.country}
                    helperText={errors.location?.country?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="location.continent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Continent"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="location.coordinates.lat"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Latitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="location.coordinates.lng"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Longitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                  />
                )}
              />
            </Grid>

            {/* Photos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Photos
              </Typography>
            </Grid>

            {photoFields.map((field, index) => (
              <Grid item xs={12} key={field.id}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Controller
                    name={`photos.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Photo URL ${index + 1}`}
                        placeholder="https://example.com/photo.jpg"
                      />
                    )}
                  />
                  {photoFields.length > 1 && (
                    <IconButton onClick={() => removePhoto(index)} color="error">
                      <Remove />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                startIcon={<Add />}
                onClick={() => appendPhoto('')}
                variant="outlined"
                size="small"
              >
                Add Photo
              </Button>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tags
              </Typography>
            </Grid>

            {tagFields.map((field, index) => (
              <Grid item xs={12} sm={6} md={4} key={field.id}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Controller
                    name={`tags.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Tag ${index + 1}`}
                        placeholder="e.g., beach, adventure, culture"
                      />
                    )}
                  />
                  {tagFields.length > 1 && (
                    <IconButton onClick={() => removeTag(index)} color="error">
                      <Remove />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                startIcon={<Add />}
                onClick={() => appendTag('')}
                variant="outlined"
                size="small"
              >
                Add Tag
              </Button>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/destinations')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={createDestinationMutation.isLoading}
                >
                  {createDestinationMutation.isLoading ? 'Creating...' : 'Create Destination'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateDestination;
