import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { Add, Delete, CalendarToday } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { format, addDays } from 'date-fns';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditItinerary = () => {
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: itinerary, isLoading: itineraryLoading } = useQuery(
    ['itinerary', id],
    async () => {
      const response = await axios.get(`/api/v1/trip-itineraries/${id}`);
      return response.data;
    }
  );

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      destination: '',
      duration: { days: 3, nights: 2 },
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      groupSize: 1,
      travelStyle: 'adventure',
      budget: { total: 1000 },
      isPublic: false,
      dailyPlan: [
        { day: 1, activities: [{ time: '09:00', activity: '', location: '' }] }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dailyPlan'
  });

  const watchedDuration = watch('duration');
  const watchedStartDate = watch('startDate');
  const watchedDestination = watch('destination');

  // Populate form with existing data
  useEffect(() => {
    if (itinerary) {
      reset({
        title: itinerary.title || '',
        description: itinerary.description || '',
        destination: itinerary.destination?._id || '',
        duration: itinerary.duration || { days: 3, nights: 2 },
        startDate: itinerary.startDate ? format(new Date(itinerary.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        endDate: itinerary.endDate ? format(new Date(itinerary.endDate), 'yyyy-MM-dd') : format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        groupSize: itinerary.groupSize || 1,
        travelStyle: itinerary.travelStyle || 'adventure',
        budget: itinerary.budget || { total: 1000 },
        isPublic: itinerary.isPublic || false,
        dailyPlan: itinerary.dailyPlan || [
          { day: 1, activities: [{ time: '09:00', activity: '', location: '' }] }
        ]
      });
    }
  }, [itinerary, reset]);

  const { data: destinations, isLoading: destinationsLoading } = useQuery(
    'destinations-list',
    async () => {
      const response = await axios.get('/api/v1/destination-guides?limit=100');
      return response.data.destinationGuides;
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  const { data: selectedDestination } = useQuery(
    ['destination-detail', watchedDestination],
    async () => {
      const response = await axios.get(`/api/v1/destination-guides/${watchedDestination}`);
      return response.data.destinationGuide;
    },
    {
      enabled: !!watchedDestination,
      staleTime: 5 * 60 * 1000
    }
  );

  const updateItineraryMutation = useMutation(
    async (data) => {
      const response = await axios.put(`/api/v1/trip-itineraries/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        navigate(`/itineraries/${id}`);
      },
      onError: (error) => {
        console.error('Update error:', error);
        setError(error.response?.data?.error || 'Failed to update itinerary');
      }
    }
  );

  const steps = ['Basic Info', 'Daily Plan', 'Review & Update'];

  const updateDailyPlan = React.useCallback((days) => {
    const currentLength = fields.length;
    
    if (currentLength === days) {
      return;
    }
    
    if (currentLength > days) {
      for (let i = currentLength - 1; i >= days; i--) {
        remove(i);
      }
    } else {
      for (let i = currentLength; i < days; i++) {
        append({
          day: i + 1,
          activities: [{ time: '09:00', activity: '', location: '' }]
        });
      }
    }
  }, [fields.length, append, remove]);

  React.useEffect(() => {
    const days = watchedDuration.days;
    if (days && days !== fields.length && days > 0 && days <= 30) {
      updateDailyPlan(days);
    }
  }, [watchedDuration.days, updateDailyPlan]);

  React.useEffect(() => {
    if (watchedStartDate && watchedDuration.days) {
      const endDate = addDays(new Date(watchedStartDate), watchedDuration.days - 1);
      setValue('endDate', format(endDate, 'yyyy-MM-dd'));
    }
  }, [watchedStartDate, watchedDuration.days, setValue]);

  const onSubmit = async (data) => {
    try {
      setError('');
      await updateItineraryMutation.mutateAsync(data);
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.error || 'Failed to update itinerary');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Itinerary Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="destination"
                control={control}
                rules={{ required: 'Destination is required' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={destinations || []}
                    loading={destinationsLoading}
                    getOptionLabel={(option) => 
                      typeof option === 'string' ? option : `${option.title} - ${option.location.city}, ${option.location.country}`
                    }
                    value={destinations?.find(d => d._id === field.value) || null}
                    onChange={(event, newValue) => {
                      field.onChange(newValue?._id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Destination"
                        error={!!errors.destination}
                        helperText={errors.destination?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="duration.days"
                control={control}
                rules={{ required: 'Duration is required', min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Duration (days)"
                    inputProps={{ min: 1, max: 30 }}
                    error={!!errors.duration?.days}
                    helperText={errors.duration?.days?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="groupSize"
                control={control}
                rules={{ required: 'Group size is required', min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Group Size"
                    inputProps={{ min: 1, max: 20 }}
                    error={!!errors.groupSize}
                    helperText={errors.groupSize?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ 
                  required: 'Start date is required',
                  validate: (value) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(value);
                    return selectedDate >= today || 'Start date cannot be in the past';
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || 'Select your trip start date'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="travelStyle"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
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
                name="budget.total"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Total Budget (₹)"
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Plan Your Daily Activities
            </Typography>
            
            {/* Recommendations Section */}
            {selectedDestination && (
              <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Recommended for {selectedDestination.title}
                  </Typography>
                  
                  {/* Popular Activities */}
                  {selectedDestination.recommendations?.activities?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Popular Activities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {selectedDestination.recommendations.activities.slice(0, 6).map((activity, index) => (
                          <Chip
                            key={index}
                            label={activity.name}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              const firstEmptyDay = fields.findIndex(day => 
                                day.activities.some(act => !act.activity)
                              );
                              if (firstEmptyDay !== -1) {
                                const firstEmptyActivity = fields[firstEmptyDay].activities.findIndex(act => !act.activity);
                                if (firstEmptyActivity !== -1) {
                                  setValue(`dailyPlan.${firstEmptyDay}.activities.${firstEmptyActivity}.activity`, activity.name);
                                }
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Popular Attractions */}
                  {selectedDestination.content?.attractions?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Must-Visit Attractions:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedDestination.content.attractions.slice(0, 6).map((attraction, index) => (
                          <Chip
                            key={index}
                            label={attraction}
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={() => {
                              const firstEmptyDay = fields.findIndex(day => 
                                day.activities.some(act => !act.location)
                              );
                              if (firstEmptyDay !== -1) {
                                const firstEmptyActivity = fields[firstEmptyDay].activities.findIndex(act => !act.location);
                                if (firstEmptyActivity !== -1) {
                                  setValue(`dailyPlan.${firstEmptyDay}.activities.${firstEmptyActivity}.location`, attraction);
                                }
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    💡 Click on any recommendation to add it to your itinerary
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {fields.map((day, dayIndex) => (
              <Card key={day.id} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Day {day.day}
                  </Typography>
                  {day.activities?.map((activity, activityIndex) => (
                    <Grid container spacing={2} key={activityIndex} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name={`dailyPlan.${dayIndex}.activities.${activityIndex}.time`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="time"
                              label="Time"
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`dailyPlan.${dayIndex}.activities.${activityIndex}.activity`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Activity"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`dailyPlan.${dayIndex}.activities.${activityIndex}.location`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Location"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const currentActivities = [...fields[dayIndex].activities];
                            currentActivities.splice(activityIndex, 1);
                            setValue(`dailyPlan.${dayIndex}.activities`, currentActivities);
                          }}
                          disabled={day.activities.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    startIcon={<Add />}
                    onClick={() => {
                      const currentActivities = [...fields[dayIndex].activities];
                      currentActivities.push({ time: '', activity: '', location: '' });
                      setValue(`dailyPlan.${dayIndex}.activities`, currentActivities);
                    }}
                  >
                    Add Activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 2:
        const formData = watch();
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Review Your Changes
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {formData.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {formData.duration.days} days, {formData.duration.nights} nights
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Group Size: {formData.groupSize} {formData.groupSize === 1 ? 'person' : 'people'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date: {formData.startDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Travel Style: {formData.travelStyle}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Daily Plan Summary
                </Typography>
                {formData.dailyPlan?.map((day) => (
                  <Box key={day.day} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Day {day.day}
                    </Typography>
                    {day.activities?.map((activity, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        {activity.time} - {activity.activity} {activity.location && `at ${activity.location}`}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = (step) => {
    const formData = watch();
    switch (step) {
      case 0:
        const isDateValid = formData.startDate && new Date(formData.startDate) >= new Date().setHours(0, 0, 0, 0);
        return formData.title && formData.destination && formData.duration.days > 0 && isDateValid;
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  // Check if user can edit this itinerary
  const canEdit = user && (user._id === itinerary?.createdBy._id || user.role === 'admin');

  if (itineraryLoading) {
    return <LoadingSpinner message="Loading itinerary..." />;
  }

  if (!canEdit) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to edit this itinerary.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Edit Trip Itinerary
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateItineraryMutation.isLoading}
                >
                  {updateItineraryMutation.isLoading ? 'Updating...' : 'Update Itinerary'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditItinerary;
