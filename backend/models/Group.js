const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 50,
    min: [2, 'Group must allow at least 2 members']
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DestinationGuide'
  },
  plannedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripItinerary'
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  posts: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    photos: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text'
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate invite code for private groups
groupSchema.pre('save', function(next) {
  if (!this.isPublic && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
