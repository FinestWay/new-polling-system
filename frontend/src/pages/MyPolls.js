import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiBarChart2, FiShare2, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPoll, setDeletingPoll] = useState(null);

  const fetchMyPolls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/polls/user/me?page=${currentPage}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setPolls(data.polls);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch your polls');
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('An error occurred while fetching polls');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMyPolls();
  }, [fetchMyPolls]);

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setDeletingPoll(pollId);
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Poll deleted successfully');
        fetchMyPolls(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete poll');
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('An error occurred while deleting the poll');
    } finally {
      setDeletingPoll(null);
    }
  };

  const copyShareLink = (shareCode) => {
    const shareUrl = `${window.location.origin}/poll/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPollStatus = (poll) => {
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (!poll.isActive) {
      return { status: 'inactive', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
    return { status: 'active', color: 'text-green-600', bg: 'bg-green-50' };
  };

  if (loading && polls.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your polls...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Polls</h1>
            <p className="text-gray-600">Manage and track all your created polls</p>
          </div>
          <Link
            to="/create"
            className="btn btn-primary flex items-center gap-2"
          >
                         <FiBarChart2 className="w-4 h-4" />
             Create New Poll
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      {polls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                 <FiBarChart2 className="w-5 h-5 text-blue-600" />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-700">Total Polls</p>
                 <p className="text-2xl font-bold text-blue-600">{polls.length}</p>
               </div>
            </div>
          </div>
          
          <div className="card bg-green-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Active Polls</p>
                <p className="text-2xl font-bold text-green-600">
                  {polls.filter(poll => getPollStatus(poll).status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card bg-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Votes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {polls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card bg-orange-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiEye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Views</p>
                <p className="text-2xl font-bold text-orange-600">
                  {polls.reduce((sum, poll) => sum + (poll.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiBarChart2 className="w-8 h-8 text-gray-400" />
             </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
            <p className="text-gray-600 mb-6">Create your first poll to get started!</p>
            <Link
              to="/create"
              className="btn btn-primary"
            >
              Create Your First Poll
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            return (
              <div key={poll._id} className="card hover:shadow-md transition-shadow">
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
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Created {formatDate(poll.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{poll.totalVotes || 0} votes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiEye className="w-4 h-4" />
                        <span>{poll.views || 0} views</span>
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
                    
                    {poll.shareCode && (
                      <button
                        onClick={() => copyShareLink(poll.shareCode)}
                        className="btn btn-outline btn-sm"
                        title="Copy Share Link"
                      >
                        <FiShare2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <Link
                      to={`/poll/${poll._id}/edit`}
                      className="btn btn-outline btn-sm"
                      title="Edit Poll"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDeletePoll(poll._id)}
                      disabled={deletingPoll === poll._id}
                      className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                      title="Delete Poll"
                    >
                      {deletingPoll === poll._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
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

export default MyPolls;

