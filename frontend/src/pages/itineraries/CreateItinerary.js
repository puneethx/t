import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
} from '@mui/material';
import { Add, Delete, CalendarToday, Save } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { format, addDays } from 'date-fns';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { guestStorage } from '../../utils/guestStorage';

const CreateItinerary = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const destinationId = location.state?.destinationId;
  const editMode = location.state?.editMode;
  const guestItinerary = location.state?.guestItinerary;

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      destination: destinationId || '',
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
  const watchedValues = watch(); // Watch all form values for auto-save

  // Auto-save draft functionality
  const saveDraft = useCallback(async (formData) => {
    try {
      if (!isAuthenticated) {
        const draftData = {
          ...formData,
          _id: currentDraftId || `draft-${Date.now()}`,
          lastSaved: new Date().toISOString()
        };
        
        const savedDraft = guestStorage.saveDraftItinerary(draftData);
        if (savedDraft) {
          setCurrentDraftId(savedDraft.id);
          setDraftSaved(true);
          setShowDraftSaved(true);
          setTimeout(() => setShowDraftSaved(false), 3000);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [isAuthenticated, currentDraftId]);

  // Auto-save effect
  useEffect(() => {
    if (!isAuthenticated && watchedValues.title) {
      const timeoutId = setTimeout(() => {
        saveDraft(watchedValues);
      }, 2000); // Save draft after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, saveDraft, isAuthenticated]);

  // Load existing draft or guest itinerary
  useEffect(() => {
    if (editMode && guestItinerary) {
      // Load guest itinerary for editing
      setValue('title', guestItinerary.title || '');
      setValue('description', guestItinerary.description || '');
      setValue('destination', guestItinerary.destination || '');
      setValue('duration', guestItinerary.duration || { days: 3, nights: 2 });
      setValue('startDate', guestItinerary.startDate ? format(new Date(guestItinerary.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setValue('endDate', guestItinerary.endDate ? format(new Date(guestItinerary.endDate), 'yyyy-MM-dd') : format(addDays(new Date(), 2), 'yyyy-MM-dd'));
      setValue('groupSize', guestItinerary.groupSize || 1);
      setValue('travelStyle', guestItinerary.travelStyle || 'adventure');
      setValue('budget', guestItinerary.budget || { total: 1000 });
      setValue('isPublic', guestItinerary.isPublic || false);
      setValue('dailyPlan', guestItinerary.dailyPlan || [
        { day: 1, activities: [{ time: '09:00', activity: '', location: '' }] }
      ]);
      setCurrentDraftId(guestItinerary.id);
    } else if (!isAuthenticated) {
      // Try to load the most recent draft
      const drafts = guestStorage.getDraftItineraries();
      if (drafts.length > 0) {
        const latestDraft = drafts[drafts.length - 1];
        if (latestDraft.title) {
          setValue('title', latestDraft.title);
          setValue('description', latestDraft.description || '');
          setValue('destination', latestDraft.destination || '');
          setValue('duration', latestDraft.duration || { days: 3, nights: 2 });
          setValue('startDate', latestDraft.startDate ? format(new Date(latestDraft.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
          setValue('endDate', latestDraft.endDate ? format(new Date(latestDraft.endDate), 'yyyy-MM-dd') : format(addDays(new Date(), 2), 'yyyy-MM-dd'));
          setValue('groupSize', latestDraft.groupSize || 1);
          setValue('travelStyle', latestDraft.travelStyle || 'adventure');
          setValue('budget', latestDraft.budget || { total: 1000 });
          setValue('isPublic', latestDraft.isPublic || false);
          setValue('dailyPlan', latestDraft.dailyPlan || [
            { day: 1, activities: [{ time: '09:00', activity: '', location: '' }] }
          ]);
          setCurrentDraftId(latestDraft.id);
        }
      }
    }
  }, [editMode, guestItinerary, setValue, isAuthenticated]);

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

  const createItineraryMutation = useMutation(
    async (data) => {
      try {
        if (isAuthenticated) {
          // Authenticated user - save to database
          const response = await axios.post('/api/v1/trip-itineraries', data);
          return { type: 'authenticated', data: response.data };
        } else {
          // Guest user - create guest itinerary and save locally
          const response = await axios.post('/api/v1/trip-itineraries/guest', data);
          const guestItinerary = guestStorage.saveItinerary(response.data.itinerary);
          // Clear the draft after successful creation
          if (currentDraftId) {
            guestStorage.removeDraftItinerary(currentDraftId);
          }
          return { type: 'guest', data: { itinerary: guestItinerary } };
        }
      } catch (error) {
        console.error('Itinerary creation error:', error);
        throw error;
      }
    },
    {
      onSuccess: (result) => {
        try {
          if (result.type === 'authenticated') {
            navigate(`/itineraries/${result.data.itinerary._id}`);
          } else {
            // For guest users, navigate to view the created itinerary
            navigate(`/itineraries/guest/${result.data.itinerary.id}`);
          }
        } catch (error) {
          console.error('Navigation error:', error);
          setError('Itinerary created but navigation failed');
        }
      },
      onError: (error) => {
        console.error('Mutation error:', error);
        setError(error.response?.data?.error || 'Failed to create itinerary');
      }
    }
  );

  // Manual save draft function
  const handleSaveDraft = async () => {
    const formData = watch();
    await saveDraft(formData);
  };

  const steps = ['Basic Info', 'Daily Plan', 'Review & Create'];

  const updateDailyPlan = React.useCallback((days) => {
    const currentLength = fields.length;
    
    if (currentLength === days) {
      return; // No change needed
    }
    
    if (currentLength > days) {
      // Remove extra days
      for (let i = currentLength - 1; i >= days; i--) {
        remove(i);
      }
    } else {
      // Add missing days
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
      await createItineraryMutation.mutateAsync(data);
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.error || 'Failed to create itinerary');
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
                              // Auto-fill activity in the first empty field
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
                              // Auto-fill location in the first empty field
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
              Review Your Itinerary
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
        return true; // Daily plan is optional
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Create Trip Itinerary
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveDraft}
                  disabled={!watch('title')}
                >
                  Save Draft
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createItineraryMutation.isLoading}
                >
                  {createItineraryMutation.isLoading ? 'Creating...' : 'Create Itinerary'}
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

      {/* Draft saved notification */}
      <Snackbar
        open={showDraftSaved}
        autoHideDuration={3000}
        onClose={() => setShowDraftSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowDraftSaved(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Draft saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateItinerary;
