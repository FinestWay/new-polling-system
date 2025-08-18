import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FiUsers, FiEye, FiClock, FiTag } from 'react-icons/fi';

const PollCard = ({ poll }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-800',
      'Politics': 'bg-red-100 text-red-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Other': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || colors['General'];
  };

  const getWinningOption = () => {
    if (!poll.options || poll.options.length === 0) return null;
    return poll.options.reduce((max, option) => 
      option.votes > max.votes ? option : max
    );
  };

  const winningOption = getWinningOption();

  return (
    <Link to={`/poll/${poll._id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {poll.title}
            </h3>
            {poll.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {poll.description}
              </p>
            )}
          </div>
        </div>

        {/* Category and Stats */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(poll.category)}`}>
            {poll.category}
          </span>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FiUsers className="w-4 h-4 mr-1" />
              {poll.totalVotes}
            </div>
            <div className="flex items-center">
              <FiEye className="w-4 h-4 mr-1" />
              {poll.views}
            </div>
          </div>
        </div>

        {/* Options Preview */}
        <div className="space-y-2 mb-4">
          {poll.options.slice(0, 3).map((option, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 truncate flex-1">
                {option.text}
              </span>
              <span className="text-sm font-medium text-gray-900 ml-2">
                {poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0}%
              </span>
            </div>
          ))}
          {poll.options.length > 3 && (
            <div className="text-sm text-gray-500">
              +{poll.options.length - 3} more options
            </div>
          )}
        </div>

        {/* Winning Option */}
        {winningOption && poll.totalVotes > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Leading: {winningOption.text}
              </span>
              <span className="text-sm font-bold text-green-800">
                {Math.round((winningOption.votes / poll.totalVotes) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <FiClock className="w-4 h-4 mr-1" />
            {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
          </div>
          <div className="flex items-center">
            {poll.creator?.avatar ? (
              <img 
                src={poll.creator.avatar} 
                alt={poll.creator.username}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-primary-600">
                  {poll.creator?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-gray-700">{poll.creator?.username}</span>
          </div>
        </div>

        {/* Tags */}
        {poll.tags && poll.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {poll.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                <FiTag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {poll.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{poll.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PollCard;




