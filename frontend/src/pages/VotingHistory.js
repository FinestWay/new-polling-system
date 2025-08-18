import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiTrendingUp, FiEye, FiCheck, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VotingHistory = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalVotes: 0,
    uniquePolls: 0,
    averageVotesPerPoll: 0
  });

  const fetchVotingHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/votes/user/history?page=${currentPage}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setVotes(data.votes);
        setTotalPages(data.totalPages);
        
        // Calculate stats
        const uniquePolls = new Set(data.votes.map(vote => vote.poll._id)).size;
        setStats({
          totalVotes: data.total,
          uniquePolls,
          averageVotesPerPoll: uniquePolls > 0 ? (data.total / uniquePolls).toFixed(1) : 0
        });
      } else {
        toast.error('Failed to fetch voting history');
      }
    } catch (error) {
      console.error('Error fetching voting history:', error);
      toast.error('An error occurred while fetching voting history');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchVotingHistory();
  }, [fetchVotingHistory]);



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPollStatus = (poll) => {
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return { status: 'closed', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (!poll.isActive) {
      return { status: 'inactive', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
    return { status: 'active', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getVotedOptionText = (vote) => {
    if (!vote.poll || !vote.poll.options) return 'Unknown option';
    const option = vote.poll.options.find(opt => opt._id === vote.option);
    return option ? option.text : 'Unknown option';
  };

  if (loading && votes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your voting history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting History</h1>
        <p className="text-gray-600">Track all the polls you've participated in</p>
      </div>

      {/* Stats Summary */}
      {votes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Votes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVotes}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-green-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Unique Polls</p>
                <p className="text-2xl font-bold text-green-600">{stats.uniquePolls}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Avg Votes/Poll</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageVotesPerPoll}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting History List */}
      {votes.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voting history yet</h3>
            <p className="text-gray-600 mb-6">Start voting on polls to see your history here!</p>
            <Link
              to="/"
              className="btn btn-primary"
            >
              Browse Polls
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {votes.map((vote) => {
            const poll = vote.poll;
                         const status = getPollStatus(poll);
            const votedOptionText = getVotedOptionText(vote);
            
            return (
              <div key={vote._id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.status}
                      </span>
                    </div>
                    
                    {poll.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{poll.description}</p>
                    )}
                    
                    {/* Vote Information */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Your Vote:</span>
                        <span className="text-sm text-green-700">{votedOptionText}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>Voted {formatDate(vote.votedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Created {formatDate(poll.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{poll.totalVotes || 0} total votes</span>
                      </div>
                      {poll.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>Expires {formatDate(poll.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/poll/${poll._id}`}
                      className="btn btn-outline btn-sm"
                      title="View Poll"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            
            <span className="flex items-center px-4 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingHistory;

