const express = require('express');
const { body, validationResult } = require('express-validator');
const Poll = require('../models/Poll');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all polls (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort = 'newest' } = req.query;
    
    const query = { isPublic: true, isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostVoted':
        sortOption = { totalVotes: -1 };
        break;
      case 'trending':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const polls = await Poll.find(query)
      .populate('creator', 'username avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Poll.countDocuments(query);
    
    res.json({
      polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    // Increment views
    poll.views += 1;
    await poll.save();
    
    // Check if user has voted
    let userVoted = null;
    if (req.user) {
      const votedOption = poll.options.find(option => 
        option.voters.some(voter => voter._id.toString() === req.user._id.toString())
      );
      if (votedOption) {
        userVoted = poll.options.indexOf(votedOption);
      }
    }
    
    res.json({
      poll,
      userVoted,
      results: poll.getResults()
    });
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll by share code
router.get('/share/:code', optionalAuth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ shareCode: req.params.code.toUpperCase() })
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    // Increment views
    poll.views += 1;
    await poll.save();
    
    // Check if user has voted
    let userVoted = null;
    if (req.user) {
      const votedOption = poll.options.find(option => 
        option.voters.some(voter => voter._id.toString() === req.user._id.toString())
      );
      if (votedOption) {
        userVoted = poll.options.indexOf(votedOption);
      }
    }
    
    res.json({
      poll,
      userVoted,
      results: poll.getResults()
    });
  } catch (error) {
    console.error('Get poll by share code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new poll
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Poll must have between 2 and 10 options'),
  body('options.*.text')
    .isLength({ min: 1, max: 100 })
    .withMessage('Option text must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'])
    .withMessage('Invalid category'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      options,
      category,
      tags,
      allowMultipleVotes,
      allowAnonymousVotes,
      isPublic,
      expiresAt
    } = req.body;

    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Expiration date must be in the future' });
    }

    const poll = new Poll({
      title,
      description,
      options: options.map(opt => ({ text: opt.text })),
      creator: req.user._id,
      category: category || 'General',
      tags: tags || [],
      allowMultipleVotes: allowMultipleVotes || false,
      allowAnonymousVotes: allowAnonymousVotes || false,
      isPublic: isPublic !== undefined ? isPublic : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await poll.save();

    // Add to user's created polls
    await req.user.updateOne({
      $push: { pollsCreated: poll._id }
    });

    const populatedPoll = await Poll.findById(poll._id)
      .populate('creator', 'username avatar');

    res.status(201).json({
      message: 'Poll created successfully',
      poll: populatedPoll
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update poll
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn(['General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creator.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this poll' });
    }

    const updates = req.body;
    delete updates.options; // Don't allow updating options after creation
    delete updates.creator; // Don't allow changing creator

    const updatedPoll = await Poll.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creator', 'username avatar');

    res.json({
      message: 'Poll updated successfully',
      poll: updatedPoll
    });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete poll
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creator.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }

    await Poll.findByIdAndDelete(req.params.id);

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's polls
router.get('/user/me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const polls = await Poll.find({ creator: req.user._id })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Poll.countDocuments({ creator: req.user._id });
    
    res.json({
      polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user polls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

