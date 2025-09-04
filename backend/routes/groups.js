const express = require('express');
const { body, validationResult } = require('express-validator');
const { Group } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create group
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('isPublic').optional().isBoolean(),
  body('maxMembers').optional().isInt({ min: 2 }),
  body('destination').optional().isMongoId(),
  body('plannedTrip').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const group = new Group({
      ...req.body,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    await group.save();
    await group.populate('members.user', 'firstName lastName');

    res.status(201).json({
      message: 'Travel group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create travel group' });
  }
});

// Get public groups
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const groups = await Group.find({ isPublic: true, isActive: true })
      .populate('creator', 'firstName lastName')
      .populate('destination', 'title location')
      .populate('plannedTrip', 'title duration')
      .select('name description members maxMembers destination plannedTrip tags createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Group.countDocuments({ isPublic: true, isActive: true });

    res.json({
      groups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    console.error('Fetch public groups error:', error);
    res.status(500).json({ error: 'Failed to fetch public groups' });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
    .populate('creator', 'firstName lastName')
    .populate('destination', 'title location')
    .populate('plannedTrip', 'title duration')
    .populate('members.user', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    console.error('Fetch user groups error:', error);
    res.status(500).json({ error: 'Failed to fetch your groups' });
  }
});

// Join group
router.post('/:id/join', authenticateToken, [
  body('inviteCode').optional().trim()
], async (req, res) => {
  try {
    const { inviteCode } = req.body;
    let group = await Group.findById(req.params.id);

    if (!group || !group.isActive) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if group is private and requires invite code
    if (!group.isPublic) {
      if (!inviteCode || inviteCode !== group.inviteCode) {
        return res.status(403).json({ 
          error: 'Invitation required',
          message: 'You need an invitation to join this private group'
        });
      }
    }

    // Check if already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ error: 'Group is full' });
    }

    group.members.push({
      user: req.user._id,
      role: 'member'
    });

    await group.save();
    await group.populate('members.user', 'firstName lastName');

    res.json({
      message: 'Successfully joined the group',
      group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: 'Not a member of this group' });
    }

    // Creator cannot leave their own group
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        error: 'Cannot leave group',
        message: 'Group creators cannot leave their own group. Transfer ownership or delete the group instead.'
      });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Add post to group
router.post('/:id/posts', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 1000 }),
  body('photos').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Must be a group member to post' });
    }

    const post = {
      author: req.user._id,
      content: req.body.content,
      photos: req.body.photos || [],
      createdAt: new Date()
    };

    group.posts.push(post);
    await group.save();

    await group.populate('posts.author', 'firstName lastName');

    res.status(201).json({
      message: 'Post added successfully',
      post: group.posts[group.posts.length - 1]
    });
  } catch (error) {
    console.error('Add post error:', error);
    res.status(500).json({ error: 'Failed to add post' });
  }
});

// Send message to group
router.post('/:id/messages', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 1000 }),
  body('messageType').optional().isIn(['text', 'image', 'system'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const group = await Group.findById(req.params.id);

    if (!group || !group.isActive) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Must be a group member to send messages' });
    }

    const message = {
      sender: req.user._id,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
      createdAt: new Date()
    };

    group.messages.push(message);
    await group.save();

    await group.populate('messages.sender', 'firstName lastName');

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: group.messages[group.messages.length - 1]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get group messages
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const group = await Group.findById(req.params.id)
      .populate('messages.sender', 'firstName lastName')
      .select('messages members isPublic');

    if (!group || !group.isActive) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user can view messages
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!group.isPublic && !isMember) {
      return res.status(403).json({ error: 'Access denied to private group messages' });
    }

    // Get messages with pagination (newest first)
    const messages = group.messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit))
      .reverse(); // Reverse to show oldest first in the returned batch

    res.json({ 
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalMessages: group.messages.length,
        hasMore: skip + parseInt(limit) < group.messages.length
      }
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get group details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'firstName lastName')
      .populate('members.user', 'firstName lastName')
      .populate('destination', 'title location')
      .populate('plannedTrip', 'title duration')
      .populate('posts.author', 'firstName lastName')
      .populate('messages.sender', 'firstName lastName');

    if (!group || !group.isActive) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user can view this group
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!group.isPublic && !isMember) {
      return res.status(403).json({ error: 'Access denied to private group' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Fetch group error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

module.exports = router;
