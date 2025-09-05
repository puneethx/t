const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { DestinationGuide, Review } = require('../models');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search destination guides
router.get('/search', [
  query('query').optional().trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid search query',
        details: errors.array()
      });
    }

    const { query: searchQuery, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = { isPublished: true };

    if (searchQuery) {
      // Enhanced search with multiple criteria
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      // Create search conditions for each term
      const searchConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { summary: { $regex: term, $options: 'i' } },
          { 'location.country': { $regex: term, $options: 'i' } },
          { 'location.city': { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { 'content.attractions': { $regex: term, $options: 'i' } },
          { 'recommendations.activities.category': { $regex: term, $options: 'i' } }
        ]
      }));

      // If multiple search terms, use $and to require all terms to match
      if (searchConditions.length > 1) {
        searchCriteria.$and = searchConditions;
      } else if (searchConditions.length === 1) {
        searchCriteria.$or = searchConditions[0].$or;
      }
    }

    const destinationGuides = await DestinationGuide.find(searchCriteria)
      .select('title summary photos location averageRating totalReviews tags content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DestinationGuide.countDocuments(searchCriteria);

    if (destinationGuides.length === 0) {
      return res.status(404).json({ 
        error: 'No destination guides found',
        message: 'Try adjusting your search terms or browse all destinations'
      });
    }

    res.json({
      destinationGuides,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: skip + destinationGuides.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all destination guides (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = { isPublished: true };

    if (search) {
      // Enhanced search with multiple criteria
      const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const searchConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { summary: { $regex: term, $options: 'i' } },
          { 'location.country': { $regex: term, $options: 'i' } },
          { 'location.city': { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { 'content.attractions': { $regex: term, $options: 'i' } },
          { 'recommendations.activities.category': { $regex: term, $options: 'i' } }
        ]
      }));

      // If multiple search terms, use $and to require all terms to match
      if (searchConditions.length > 1) {
        searchCriteria.$and = searchConditions;
      } else if (searchConditions.length === 1) {
        searchCriteria.$or = searchConditions[0].$or;
      }
    }

    const destinationGuides = await DestinationGuide.find(searchCriteria)
      .select('title summary photos location averageRating totalReviews tags content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DestinationGuide.countDocuments(searchCriteria);

    res.json({
      destinationGuides,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch destinations error:', error);
    res.status(500).json({ error: 'Failed to fetch destination guides' });
  }
});

// Get destination guide by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const destinationGuide = await DestinationGuide.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!destinationGuide) {
      return res.status(404).json({ 
        error: 'Destination guide not found',
        message: 'The requested destination guide is no longer available'
      });
    }

    // Only show unpublished guides to admin or creator
    if (!destinationGuide.isPublished && 
        (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== destinationGuide.createdBy._id.toString()))) {
      return res.status(404).json({ 
        error: 'Destination guide not found',
        message: 'The requested destination guide is no longer available'
      });
    }

    // Get reviews for this destination
    const reviews = await Review.find({ 
      resourceId: destinationGuide._id,
      resourceType: 'destination-guide'
    })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      ...destinationGuide.toObject(),
      reviews
    });
  } catch (error) {
    console.error('Fetch destination error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Destination guide not found' });
    }
    res.status(500).json({ error: 'Failed to fetch destination guide' });
  }
});

// Create destination guide (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('summary').trim().isLength({ min: 1, max: 500 }),
  body('description').trim().isLength({ min: 1 }),
  body('location.country').trim().isLength({ min: 1 }),
  body('location.city').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const destinationGuide = new DestinationGuide({
      ...req.body,
      createdBy: req.user._id
    });

    await destinationGuide.save();

    res.status(201).json({
      message: 'Destination guide created successfully',
      destinationGuide
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ error: 'Failed to create destination guide' });
  }
});

// Update destination guide (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('summary').optional().trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const destinationGuide = await DestinationGuide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destinationGuide) {
      return res.status(404).json({ error: 'Destination guide not found' });
    }

    res.json({
      message: 'Destination guide updated successfully',
      destinationGuide
    });
  } catch (error) {
    console.error('Update destination error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Destination guide not found' });
    }
    res.status(500).json({ error: 'Failed to update destination guide' });
  }
});

// Delete destination guide (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const destinationGuide = await DestinationGuide.findByIdAndDelete(req.params.id);

    if (!destinationGuide) {
      return res.status(404).json({ error: 'Destination guide not found' });
    }

    res.json({ message: 'Destination guide deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Destination guide not found' });
    }
    res.status(500).json({ error: 'Failed to delete destination guide' });
  }
});

module.exports = router;
