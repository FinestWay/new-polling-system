const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  options: [pollOptionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  allowAnonymousVotes: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  category: {
    type: String,
    enum: ['General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate share code before saving
pollSchema.pre('save', function(next) {
  if (!this.shareCode) {
    this.shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Virtual for checking if poll is expired
pollSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to add vote
pollSchema.methods.addVote = function(optionIndex, userId) {
  if (this.isExpired) {
    throw new Error('Poll has expired');
  }
  
  if (!this.isActive) {
    throw new Error('Poll is not active');
  }
  
  const option = this.options[optionIndex];
  if (!option) {
    throw new Error('Invalid option');
  }
  
  // Check if user already voted (unless anonymous votes are allowed)
  if (!this.allowAnonymousVotes && userId) {
    const hasVoted = this.options.some(opt => 
      opt.voters.includes(userId)
    );
    
    if (hasVoted && !this.allowMultipleVotes) {
      throw new Error('User has already voted');
    }
  }
  
  option.votes += 1;
  if (userId && !this.allowAnonymousVotes) {
    option.voters.push(userId);
  }
  this.totalVotes += 1;
  
  return this.save();
};

// Method to remove vote
pollSchema.methods.removeVote = function(optionIndex, userId) {
  const option = this.options[optionIndex];
  if (!option) {
    throw new Error('Invalid option');
  }
  
  const voterIndex = option.voters.indexOf(userId);
  if (voterIndex === -1) {
    throw new Error('User has not voted for this option');
  }
  
  option.votes -= 1;
  option.voters.splice(voterIndex, 1);
  this.totalVotes -= 1;
  
  return this.save();
};

// Method to get poll results
pollSchema.methods.getResults = function() {
  const results = this.options.map(option => ({
    text: option.text,
    votes: option.votes,
    percentage: this.totalVotes > 0 ? ((option.votes / this.totalVotes) * 100).toFixed(1) : 0
  }));
  
  return {
    totalVotes: this.totalVotes,
    results: results
  };
};

module.exports = mongoose.model('Poll', pollSchema);

