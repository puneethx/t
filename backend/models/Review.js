const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['destination-guide', 'trip-itinerary'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    required: true,
    enum: ['DestinationGuide', 'TripItinerary']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  photos: [String],
  helpfulVotes: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  location: String, // For filtering reviews by location
  activity: String  // For filtering reviews by activity
}, {
  timestamps: true
});

// Ensure one review per user per resource
reviewSchema.index({ user: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
