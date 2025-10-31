import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiTrendingUp, FiClock, FiUsers, FiEye } from 'react-icons/fi';
import PollCard from '../components/PollCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { polls, loading, fetchPolls, clearPolls } = usePoll();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', 'General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'];
  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: FiClock },
    { value: 'oldest', label: 'Oldest', icon: FiClock },
    { value: 'mostVoted', label: 'Most Voted', icon: FiUsers },
    { value: 'trending', label: 'Trending', icon: FiTrendingUp }
  ];

  // useEffect(() => {
  //   fetchPolls({
  //     page: currentPage,
  //     search: searchTerm,
  //     category: category === 'All' ? '' : category,
  //     sort: sortBy
  //   });
  // }, [currentPage, searchTerm, category, sortBy]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearPolls();
      return;
    }

    fetchPolls({
      page: currentPage,
      search: searchTerm,
      category: category === 'All' ? '' : category,
      sort: sortBy
    })
  }, [isAuthenticated, currentPage, searchTerm, category, sortBy, fetchPolls, clearPolls])


  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to PollMaster
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sign in or create an account to explore polls, cast your votes, and create your own.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
          Create and Vote on Polls
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of users creating and participating in polls. Get
          real-time results and insights.
        </p> */}
        {isAuthenticated ? (
          <Link to="/create" className="btn btn-primary text-lg px-8 py-3">
            Create Your Poll
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input md:w-48"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input md:w-48"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEye className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No polls found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || category !== "All"
              ? "Try adjusting your search criteria"
              : "Be the first to create a poll!"}
          </p>
          {isAuthenticated && (
            <Link to="/create" className="btn btn-primary">
              Create Poll
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {polls.length > 0 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={polls.length < 10}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Home;




