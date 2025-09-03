const mongoose = require('mongoose');

const tripItinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DestinationGuide',
    required: [true, 'Destination is required']
  },
  duration: {
    days: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day']
    },
    nights: {
      type: Number,
      required: [true, 'Duration in nights is required'],
      min: [0, 'Nights cannot be negative']
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  dailyPlan: [{
    day: {
      type: Number,
      required: true
    },
    date: Date,
    activities: [{
      time: String,
      activity: String,
      location: String,
      notes: String,
      estimatedCost: Number
    }],
    lodging: {
      name: String,
      address: String,
      checkIn: String,
      checkOut: String,
      cost: Number
    },
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
      },
      restaurant: String,
      cuisine: String,
      estimatedCost: Number
    }]
  }],
  budget: {
    total: Number,
    breakdown: {
      lodging: Number,
      dining: Number,
      activities: Number,
      transportation: Number,
      miscellaneous: Number
    }
  },
  groupSize: {
    type: Number,
    default: 1,
    min: [1, 'Group size must be at least 1']
  },
  travelStyle: {
    type: String,
    enum: ['adventure', 'luxury', 'budget', 'cultural', 'relaxation'],
    default: 'adventure'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String]
}, {
  timestamps: true
});

// Validate end date is after start date
tripItinerarySchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Index for search functionality
tripItinerarySchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('TripItinerary', tripItinerarySchema);
