const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Ensure one favorite per user per resource
favoriteSchema.index({ user: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
