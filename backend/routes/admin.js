const express = require('express');
const { body, validationResult } = require('express-validator');
const { DestinationGuide, TripItinerary, User, Review, Group } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      DestinationGuide.countDocuments(),
      TripItinerary.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments(),
      Group.countDocuments({ isActive: true })
    ]);

    const recentActivity = await Promise.all([
      DestinationGuide.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
      TripItinerary.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt')
    ]);

    res.json({
      totalDestinations: stats[0],
      totalItineraries: stats[1], 
      totalUsers: stats[2],
      totalReviews: stats[3],
      totalGroups: stats[4],
      recentActivity: [
        ...recentActivity[0].map(item => ({
          description: `New destination: ${item.title}`,
          timestamp: item.createdAt
        })),
        ...recentActivity[1].map(item => ({
          description: `New itinerary: ${item.title}`,
          timestamp: item.createdAt
        })),
        ...recentActivity[2].map(item => ({
          description: `New user: ${item.firstName} ${item.lastName}`,
          timestamp: item.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('firstName lastName email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot modify admin user status' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all destination guides (admin view)
router.get('/destinations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, published } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = {};
    if (published !== undefined) {
      searchCriteria.isPublished = published === 'true';
    }

    const destinations = await DestinationGuide.find(searchCriteria)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DestinationGuide.countDocuments(searchCriteria);

    res.json({
      destinations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch admin destinations error:', error);
    res.status(500).json({ error: 'Failed to fetch destination guides' });
  }
});

// Toggle destination guide published status
router.patch('/destinations/:id/toggle-publish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const destination = await DestinationGuide.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination guide not found' });
    }

    destination.isPublished = !destination.isPublished;
    await destination.save();

    res.json({
      message: `Destination guide ${destination.isPublished ? 'published' : 'unpublished'} successfully`,
      destination: {
        id: destination._id,
        isPublished: destination.isPublished
      }
    });
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json({ error: 'Failed to update publish status' });
  }
});

// Get all reviews (admin moderation)
router.get('/reviews', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, resourceType } = req.query;
    const skip = (page - 1) * limit;

    let searchCriteria = {};
    if (resourceType && ['destination-guide', 'trip-itinerary'].includes(resourceType)) {
      searchCriteria.resourceType = resourceType;
    }

    const reviews = await Review.find(searchCriteria)
      .populate('user', 'firstName lastName email')
      .populate('resourceId', 'title')
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
    console.error('Fetch admin reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Delete review (admin moderation)
router.delete('/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
