import React, { useState } from 'react';
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
} from '@mui/material';
import { Add, Delete, CalendarToday } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { format, addDays } from 'date-fns';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const CreateItinerary = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const destinationId = location.state?.destinationId;

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

  const { data: destinations } = useQuery(
    'destinations-list',
    async () => {
      const response = await axios.get('/api/v1/destination-guides?limit=100');
      return response.data.destinationGuides;
    }
  );

  const createItineraryMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/v1/trip-itineraries', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        navigate(`/itineraries/${data.itinerary._id}`);
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Failed to create itinerary');
      }
    }
  );

  const steps = ['Basic Info', 'Daily Plan', 'Review & Create'];

  const updateDailyPlan = (days) => {
    const currentPlan = fields;
    const newPlan = [];
    
    for (let i = 0; i < days; i++) {
      if (currentPlan[i]) {
        newPlan.push(currentPlan[i]);
      } else {
        newPlan.push({
          day: i + 1,
          activities: [{ time: '09:00', activity: '', location: '' }]
        });
      }
    }
    
    // Remove extra days
    while (fields.length > days) {
      remove(fields.length - 1);
    }
    
    // Add missing days
    while (fields.length < days) {
      append({
        day: fields.length + 1,
        activities: [{ time: '09:00', activity: '', location: '' }]
      });
    }
  };

  React.useEffect(() => {
    if (watchedDuration.days !== fields.length) {
      updateDailyPlan(watchedDuration.days);
    }
  }, [watchedDuration.days]);

  React.useEffect(() => {
    if (watchedStartDate && watchedDuration.days) {
      const endDate = addDays(new Date(watchedStartDate), watchedDuration.days - 1);
      setValue('endDate', format(endDate, 'yyyy-MM-dd'));
    }
  }, [watchedStartDate, watchedDuration.days, setValue]);

  const onSubmit = (data) => {
    createItineraryMutation.mutate(data);
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
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
                    label="Total Budget ($)"
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
            {fields.map((day, dayIndex) => (
              <Card key={day.id} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Day {day.day}
                  </Typography>
                  {day.activities?.map((activity, activityIndex) => (
                    <Grid container spacing={2} key={activityIndex} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Time"
                          value={activity.time || ''}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[dayIndex].activities[activityIndex].time = e.target.value;
                            setValue('dailyPlan', newFields);
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Activity"
                          value={activity.activity || ''}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[dayIndex].activities[activityIndex].activity = e.target.value;
                            setValue('dailyPlan', newFields);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={activity.location || ''}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[dayIndex].activities[activityIndex].location = e.target.value;
                            setValue('dailyPlan', newFields);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const newFields = [...fields];
                            newFields[dayIndex].activities.splice(activityIndex, 1);
                            setValue('dailyPlan', newFields);
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
                      const newFields = [...fields];
                      newFields[dayIndex].activities.push({ time: '', activity: '', location: '' });
                      setValue('dailyPlan', newFields);
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
        return formData.title && formData.destination && formData.duration.days > 0 && formData.startDate;
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
            <Box>
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
    </Container>
  );
};

export default CreateItinerary;
