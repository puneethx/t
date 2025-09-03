const express = require('express');
const { body, validationResult } = require('express-validator');
const { Favorite, DestinationGuide, TripItinerary } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add favorite
router.post('/', authenticateToken, [
  body('type').isIn(['destination-guide', 'trip-itinerary']),
  body('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: errors.array()
      });
    }

    const { type, id, notes } = req.body;

    // Verify resource exists
    let resource;
    let resourceModel;
    if (type === 'destination-guide') {
      resource = await DestinationGuide.findById(id);
      resourceModel = 'DestinationGuide';
    } else {
      resource = await TripItinerary.findById(id);
      resourceModel = 'TripItinerary';
    }

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      resourceId: id
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Item already in favorites' });
    }

    const favorite = new Favorite({
      user: req.user._id,
      resourceType: type,
      resourceId: id,
      resourceModel,
      notes
    });

    await favorite.save();

    res.json({
      message: `${type === 'destination-guide' ? 'Destination guide' : 'Trip itinerary'} added to favorites`,
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let searchCriteria = { user: req.user._id };
    
    if (type && ['destination-guide', 'trip-itinerary'].includes(type)) {
      searchCriteria.resourceType = type;
    }

    const favorites = await Favorite.find(searchCriteria)
      .populate({
        path: 'resourceId',
        select: 'title summary photos location averageRating totalReviews duration startDate'
      })
      .sort({ createdAt: -1 });

    res.json({ favorites });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Remove favorite
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await Favorite.findByIdAndDelete(req.params.id);

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
