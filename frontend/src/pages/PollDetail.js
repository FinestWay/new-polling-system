import React , { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  FiUser,
  FiCalendar,
  FiUsers,
  FiEye,
  FiShare2,
  FiCheck,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const PollDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth() // Removed 'user' since it's unused

  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [userVoted, setUserVoted] = useState(null)
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Fixed: Wrapped fetchPollDetails in useCallback with proper dependencies
  const fetchPollDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/polls/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setUserVoted(data.userVoted)
        setResults(data.results)
        setShowResults(data.userVoted !== null)
      } else if (response.status === 404) {
        toast.error('Poll not found')
        navigate('/')
      } else {
        toast.error('Failed to load poll')
      }
    } catch (error) {
      console.error('Error fetching poll:', error)
      toast.error('An error occurred while loading the poll')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  // Fixed: Added fetchPollDetails to dependency array
  useEffect(() => {
    fetchPollDetails()
  }, [fetchPollDetails])

  const handleVote = async optionIndex => {
    if (!isAuthenticated) {
      toast.error('Please login to vote')
      return
    }

    if (userVoted !== null) {
      toast.error('You have already voted on this poll')
      return
    }

    if (!poll.isActive) {
      toast.error('This poll is not active')
      return
    }

    if (poll.isExpired) {
      toast.error('This poll has expired')
      return
    }

    setVoting(true)
    try {
      const response = await fetch(`/api/votes/${poll._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ optionIndex })
      })

      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setUserVoted(data.userVoted)
        setResults(data.results)
        setShowResults(true)
        toast.success('Vote recorded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to record vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('An error occurred while voting')
    } finally {
      setVoting(false)
    }
  }

  const handleUnvote = async () => {
    if (!isAuthenticated || userVoted === null) return

    setVoting(true)
    try {
      const response = await fetch(`/api/votes/${poll._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          optionIndex: userVoted,
          action: 'unvote'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setUserVoted(data.userVoted)
        setResults(data.results)
        setShowResults(false)
        toast.success('Vote removed successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to remove vote')
      }
    } catch (error) {
      console.error('Error unvoting:', error)
      toast.error('An error occurred while removing vote')
    } finally {
      setVoting(false)
    }
  }

  const copyShareLink = () => {
    if (!poll) return
    const shareUrl = `${window.location.origin}/poll/${poll._id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPollStatus = () => {
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return { status: 'Expired', color: 'text-red-600', bg: 'bg-red-50' }
    }
    if (!poll.isActive) {
      return { status: 'Inactive', color: 'text-gray-600', bg: 'bg-gray-50' }
    }
    return { status: 'Active', color: 'text-green-600', bg: 'bg-green-50' }
  }

  const getWinningOption = () => {
    // Check if results exists and is an array
    if (!results || !Array.isArray(results) || results.length === 0) return null

    const maxVotes = Math.max(...results.map(r => r?.votes || 0))
    return results.find(r => r?.votes === maxVotes)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading poll...</p>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Poll Not Found
          </h2>
          <p className='text-gray-600 mb-6'>
            The poll you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const pollStatus = getPollStatus()
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Poll Header */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex justify-between items-start mb-4'>
            <h1 className='text-3xl font-bold text-gray-800'>{poll.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${pollStatus.color} ${pollStatus.bg}`}
            >
              {pollStatus.status}
            </span>
          </div>

          {poll.description && (
            <p className='text-gray-600 mb-6'>{poll.description}</p>
          )}

          {/* Poll Meta Information */}
          <div className='flex flex-wrap gap-6 text-sm text-gray-500'>
            <div className='flex items-center gap-2'>
              <FiUser />
              <span>
                Created by <strong>{poll.creator.username}</strong>
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <FiCalendar />
              <span>{formatDate(poll.createdAt)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FiUsers />
              <span>
                <strong>{poll.totalVotes || 0}</strong> Total Votes
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <FiEye />
              <span>
                <strong>{poll.views || 0}</strong> Views
              </span>
            </div>
          </div>

          {poll.category && (
            <div className='mt-4'>
              <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                Category: {poll.category}
              </span>
            </div>
          )}

          {poll.tags && poll.tags.length > 0 && (
            <div className='mt-4'>
              <span className='text-sm text-gray-600 mr-2'>Tags:</span>
              {poll.tags.map((tag, index) => (
                <span
                  key={index}
                  className='bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mr-2'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {poll.expiresAt && (
            <div className='mt-4 flex items-center gap-2 text-sm'>
              <FiClock />
              <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
                {isExpired ? 'Expired on' : 'Expires on'}{' '}
                {formatDate(poll.expiresAt)}
              </span>
            </div>
          )}

          {/* Share Button */}
          <div className='mt-6'>
            <button
              onClick={copyShareLink}
              className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors'
            >
              <FiShare2 />
              Share Poll
            </button>
          </div>
        </div>

        {/* Inactive/Expired Warning */}
        {!poll.isActive && (
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
            <p className='text-gray-600 text-center'>
              This poll is currently inactive and cannot be voted on.
            </p>
          </div>
        )}

        {isExpired && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <p className='text-red-600 text-center'>
              This poll has expired and voting is closed.
            </p>
          </div>
        )}

        {/* Poll Options */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>
            {showResults ? 'Results' : 'Cast Your Vote'}
          </h2>

          <div className='space-y-4'>
            {poll.options.map((option, index) => {
              const result = results && results[index] ? results[index] : null
              const percentage =
                result && result.votes !== undefined && poll.totalVotes > 0
                  ? Math.round((result.votes / poll.totalVotes) * 100)
                  : 0

              const isUserVote = userVoted === index
              const canVote =
                isAuthenticated &&
                !isExpired &&
                poll.isActive &&
                userVoted === null

              return (
                <div
                  key={index}
                  className={`relative border rounded-lg p-4 transition-all ${
                    isUserVote
                      ? 'border-blue-500 bg-blue-50'
                      : canVote
                      ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      : 'border-gray-200'
                  }`}
                  onClick={canVote ? () => handleVote(index) : undefined}
                >
                  {showResults && (
                    <div
                      className='absolute inset-0 bg-blue-100 rounded-lg transition-all'
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className='relative flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {isUserVote && <FiCheck className='text-blue-600' />}
                      <span className='font-medium text-gray-800'>
                        {option.text}
                      </span>
                    </div>

                    {showResults && (
                      <div className='flex items-center gap-4'>
                        <span className='text-sm font-medium text-gray-600'>
                          {result?.votes || 0} votes
                        </span>
                        <span className='text-lg font-bold text-gray-800'>
                          {percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          {isAuthenticated && userVoted !== null && (
            <div className='mt-6 flex gap-3'>
              <button
                onClick={handleUnvote}
                disabled={voting || !poll.isActive || isExpired}
                className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
              >
                {voting ? 'Removing...' : 'Remove Vote'}
              </button>

              <button
                onClick={() => setShowResults(!showResults)}
                className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                {showResults ? 'Hide Results' : 'Show Results'}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className='mt-6 text-center'>
              <p className='text-gray-600 mb-4'>
                Please login to vote on this poll
              </p>
              <button
                onClick={() => navigate('/login')}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Login
              </button>
            </div>
          )}

          {/* Results Summary */}
          {showResults && results && (
            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FiTrendingUp className='text-green-600' />
                  <span className='font-medium text-gray-800'>
                    Leading: {getWinningOption()?.option || 'No votes yet'}
                  </span>
                </div>
                <span className='text-sm text-gray-600'>
                  Total votes: {poll.totalVotes || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PollDetail
