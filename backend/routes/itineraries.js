const express = require('express');
const { body, validationResult } = require('express-validator');
const { TripItinerary, DestinationGuide, Review } = require('../models');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create guest trip itinerary (for non-authenticated users)
router.post('/guest', [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('destination').isString(),
  body('duration.days').isInt({ min: 1 }),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // For guest users, we'll create a temporary itinerary without saving to database
    // This is just for demonstration purposes
    const guestItinerary = {
      _id: 'guest-' + Date.now(),
      ...req.body,
      createdBy: null,
      isPublic: false,
      createdAt: new Date()
    };

    res.status(201).json({
      message: 'Guest itinerary created successfully',
      itinerary: guestItinerary
    });
  } catch (error) {
    console.error('Create guest itinerary error:', error);
    res.status(500).json({ error: 'Failed to create guest itinerary' });
  }
});

// Create trip itinerary
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('destination').isMongoId(),
  body('duration.days').isInt({ min: 1 }),
  body('duration.nights').isInt({ min: 0 }),
  body('startDate').isISO8601().custom((value) => {
    const startDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new Error('Start date cannot be in the past');
    }
    return true;
  }),
  body('endDate').isISO8601(),
  body('groupSize').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Verify destination exists
    const destination = await DestinationGuide.findById(req.body.destination);
    if (!destination) {
      return res.status(400).json({ 
        error: 'Invalid destination',
        message: 'The selected destination is not available'
      });
    }

    // Validate date range
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (endDate <= startDate) {
      return res.status(400).json({ 
        error: 'Invalid date range',
        message: 'End date must be after start date'
      });
    }

    const itinerary = new TripItinerary({
      ...req.body,
      createdBy: req.user._id
    });

    await itinerary.save();
    await itinerary.populate('destination', 'title location');

    res.status(201).json({
      message: 'Trip itinerary created successfully',
      itinerary
    });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ error: 'Failed to create trip itinerary' });
  }
});

// Get all itineraries (public ones or user's own)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = { isPublic: true };
    
    // If user is authenticated, also include their private itineraries
    if (req.user) {
      searchCriteria = {
        $or: [
          { isPublic: true },
          { createdBy: req.user._id }
        ]
      };
    }

    const itineraries = await TripItinerary.find(searchCriteria)
      .populate('destination', 'title location photos')
      .populate('createdBy', 'firstName lastName')
      .select('title description duration startDate endDate budget groupSize travelStyle averageRating totalReviews tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TripItinerary.countDocuments(searchCriteria);

    res.json({
      itineraries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch itineraries error:', error);
    res.status(500).json({ error: 'Failed to fetch trip itineraries' });
  }
});

// Get itinerary by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const itinerary = await TripItinerary.findById(req.params.id)
      .populate('destination')
      .populate('createdBy', 'firstName lastName');

    if (!itinerary) {
      return res.status(404).json({ 
        error: 'Trip itinerary not found',
        message: 'The requested itinerary is not available'
      });
    }

    // Check if user can view this itinerary
    if (!itinerary.isPublic && 
        (!req.user || (req.user._id.toString() !== itinerary.createdBy._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This itinerary is private'
      });
    }

    // Get reviews for this itinerary
    const reviews = await Review.find({ 
      resourceId: itinerary._id,
      resourceType: 'trip-itinerary'
    })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      ...itinerary.toObject(),
      reviews
    });
  } catch (error) {
    console.error('Fetch itinerary error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Trip itinerary not found' });
    }
    res.status(500).json({ error: 'Failed to fetch trip itinerary' });
  }
});

// Update itinerary (owner or admin)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('startDate').optional().isISO8601().custom((value) => {
    const startDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new Error('Start date cannot be in the past');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const itinerary = await TripItinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Trip itinerary not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== itinerary.createdBy.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this itinerary' });
    }

    const updatedItinerary = await TripItinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('destination', 'title location');

    res.json({
      message: 'Trip itinerary updated successfully',
      itinerary: updatedItinerary
    });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ error: 'Failed to update trip itinerary' });
  }
});

// Delete itinerary (owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await TripItinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Trip itinerary not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== itinerary.createdBy.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this itinerary' });
    }

    await TripItinerary.findByIdAndDelete(req.params.id);

    res.json({ message: 'Trip itinerary deleted successfully' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ error: 'Failed to delete trip itinerary' });
  }
});

module.exports = router;
