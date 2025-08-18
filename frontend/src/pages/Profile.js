import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiBarChart2, FiTrendingUp, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pollsCreated: 0,
    totalVotes: 0,
    pollsVoted: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [pollsResponse, votesResponse] = await Promise.all([
        fetch('/api/polls/user/me'),
        fetch('/api/votes/user/history')
      ]);

      if (pollsResponse.ok) {
        const pollsData = await pollsResponse.json();
        setStats(prev => ({ ...prev, pollsCreated: pollsData.total }));
      }

      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setStats(prev => ({ 
          ...prev, 
          pollsVoted: votesData.total,
          totalVotes: votesData.votes.length
        }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-primary-600" />
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex-1">
                        <input
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleInputChange}
                          placeholder="Enter image URL"
                          className="input input-bordered w-full"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter a valid image URL for your profile picture
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                      minLength={3}
                      maxLength={30}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user.username}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Statistics</h2>
            
            <div className="space-y-4">
              {/* Polls Created */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Polls Created</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.pollsCreated}</p>
                  </div>
                </div>
              </div>

              {/* Polls Voted */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Polls Voted</p>
                    <p className="text-2xl font-bold text-green-600">{stats.pollsVoted}</p>
                  </div>
                </div>
              </div>

              {/* Total Votes */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Votes</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalVotes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href="/create"
                  className="block w-full btn btn-primary btn-sm"
                >
                  Create New Poll
                </a>
                <a
                  href="/my-polls"
                  className="block w-full btn btn-outline btn-sm"
                >
                  View My Polls
                </a>
                <a
                  href="/voting-history"
                  className="block w-full btn btn-outline btn-sm"
                >
                  Voting History
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

