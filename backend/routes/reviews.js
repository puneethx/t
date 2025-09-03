const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Review, DestinationGuide, TripItinerary } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', authenticateToken, [
  body('resourceType').isIn(['destination-guide', 'trip-itinerary']),
  body('resourceId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 1, max: 1000 }),
  body('location').optional().trim(),
  body('activity').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { resourceType, resourceId, rating, comment, location, activity, photos } = req.body;

    // Verify resource exists
    let resource;
    let resourceModel;
    if (resourceType === 'destination-guide') {
      resource = await DestinationGuide.findById(resourceId);
      resourceModel = 'DestinationGuide';
    } else {
      resource = await TripItinerary.findById(resourceId);
      resourceModel = 'TripItinerary';
    }

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user already reviewed this resource
    const existingReview = await Review.findOne({
      user: req.user._id,
      resourceId
    });

    if (existingReview) {
      return res.status(400).json({ 
        error: 'Review already exists',
        message: 'You have already reviewed this item. You can edit your existing review.'
      });
    }

    const review = new Review({
      user: req.user._id,
      resourceType,
      resourceId,
      resourceModel,
      rating,
      comment,
      location,
      activity,
      photos: photos || []
    });

    await review.save();

    // Update average rating
    const reviews = await Review.find({ resourceId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await resource.constructor.findByIdAndUpdate(resourceId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });

    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a resource
router.get('/resource/:resourceId', [
  query('location').optional().trim(),
  query('activity').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { location, activity, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = { resourceId };
    
    if (location) {
      searchCriteria.location = new RegExp(location, 'i');
    }
    
    if (activity) {
      searchCriteria.activity = new RegExp(activity, 'i');
    }

    const reviews = await Review.find(searchCriteria)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(searchCriteria);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Update review (owner only)
router.put('/:id', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName');

    // Recalculate average rating
    const reviews = await Review.find({ resourceId: review.resourceId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const ResourceModel = review.resourceModel === 'DestinationGuide' ? DestinationGuide : TripItinerary;
    await ResourceModel.findByIdAndUpdate(review.resourceId, {
      averageRating: Math.round(avgRating * 10) / 10
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== review.user.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    const reviews = await Review.find({ resourceId: review.resourceId });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    
    const ResourceModel = review.resourceModel === 'DestinationGuide' ? DestinationGuide : TripItinerary;
    await ResourceModel.findByIdAndUpdate(review.resourceId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
