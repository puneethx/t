const mongoose = require('mongoose');

const destinationGuideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    }
  },
  photos: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  content: {
    history: String,
    culture: String,
    attractions: [String],
    bestTimeToVisit: String,
    climate: String,
    language: [String],
    currency: String
  },
  recommendations: {
    lodging: [{
      name: String,
      type: {
        type: String,
        enum: ['hotel', 'hostel', 'resort', 'guesthouse', 'villa', 'apartment']
      },
      priceRange: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury']
      },
      description: String,
      website: String
    }],
    dining: [{
      name: String,
      cuisine: String,
      priceRange: {
        type: String,
        enum: ['budget', 'mid-range', 'fine-dining']
      },
      description: String,
      address: String
    }],
    activities: [{
      name: String,
      category: {
        type: String,
        enum: ['adventure', 'cultural', 'relaxation', 'nightlife', 'shopping', 'nature']
      },
      duration: String,
      difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'challenging']
      },
      description: String,
      cost: String
    }]
  },
  tags: [String],
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
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
destinationGuideSchema.index({ 
  title: 'text', 
  summary: 'text', 
  'location.country': 'text', 
  'location.city': 'text',
  tags: 'text'
});

module.exports = mongoose.model('DestinationGuide', destinationGuideSchema);
