const express = require('express');
const { body, validationResult } = require('express-validator');
const Poll = require('../models/Poll');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Vote on a poll
router.post('/:pollId', optionalAuth, [
  body('optionIndex')
    .isInt({ min: 0 })
    .withMessage('Option index must be a valid number'),
  body('action')
    .optional()
    .isIn(['vote', 'unvote'])
    .withMessage('Action must be either vote or unvote')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pollId } = req.params;
    const { optionIndex, action = 'vote' } = req.body;
    const userId = req.user ? req.user._id : null;

    const poll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    if (poll.isExpired) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Check if option exists
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    let updatedPoll;
    let userVoted = null;

    if (action === 'vote') {
      try {
        updatedPoll = await poll.addVote(optionIndex, userId);
        userVoted = optionIndex;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    } else if (action === 'unvote') {
      if (!userId) {
        return res.status(400).json({ message: 'Must be logged in to unvote' });
      }
      
      try {
        updatedPoll = await poll.removeVote(optionIndex, userId);
        userVoted = null;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // Populate the updated poll
    updatedPoll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`poll-${pollId}`).emit('poll-updated', {
      poll: updatedPoll,
      results: updatedPoll.getResults(),
      userVoted
    });

    res.json({
      message: action === 'vote' ? 'Vote recorded successfully' : 'Vote removed successfully',
      poll: updatedPoll,
      results: updatedPoll.getResults(),
      userVoted
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll results
router.get('/:pollId/results', optionalAuth, async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user ? req.user._id : null;

    const poll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user has voted
    let userVoted = null;
    if (userId) {
      const votedOption = poll.options.find(option => 
        option.voters.some(voter => voter._id.toString() === userId.toString())
      );
      if (votedOption) {
        userVoted = poll.options.indexOf(votedOption);
      }
    }

    res.json({
      poll,
      results: poll.getResults(),
      userVoted
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's voting history
router.get('/user/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await req.user.populate({
      path: 'votesCast.poll',
      populate: {
        path: 'creator',
        select: 'username avatar'
      }
    });

    const votes = user.votesCast
      .sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt))
      .slice((page - 1) * limit, page * limit);

    const total = user.votesCast.length;

    res.json({
      votes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get voting history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll analytics (for poll creator or admin)
router.get('/:pollId/analytics', auth, async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .populate('options.voters', 'username avatar');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is creator or admin
    if (poll.creator._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const results = poll.getResults();
    
    // Calculate additional analytics
    const totalVoters = poll.options.reduce((sum, option) => sum + option.voters.length, 0);
    const uniqueVoters = new Set();
    poll.options.forEach(option => {
      option.voters.forEach(voter => uniqueVoters.add(voter._id.toString()));
    });

    const analytics = {
      poll,
      results,
      totalVotes: poll.totalVotes,
      totalVoters: totalVoters,
      uniqueVoters: uniqueVoters.size,
      views: poll.views,
      engagementRate: poll.views > 0 ? ((uniqueVoters.size / poll.views) * 100).toFixed(2) : 0,
      averageVotesPerVoter: uniqueVoters.size > 0 ? (poll.totalVotes / uniqueVoters.size).toFixed(2) : 0,
      createdAt: poll.createdAt,
      expiresAt: poll.expiresAt,
      isExpired: poll.isExpired
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

