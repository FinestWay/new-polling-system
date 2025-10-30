import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback
} from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'

axios.interceptors.request.use((req) => {
  console.log("AXIOS REQ:", req.method, req.url, req.data);
  return req;
});

axios.interceptors.response.use(
  (res) => {
    console.log("AXIOS RES:", res.status, res.config.url, res.data);
    return res;
  },
  (err) => {
    console.error("AXIOS ERR:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);


const PollContext = createContext()

const initialState = {
  polls: [],
  currentPoll: null,
  loading: false,
  error: null,
  socket: null
}

const pollReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_POLLS':
      return { ...state, polls: action.payload, loading: false }
    case 'SET_CURRENT_POLL':
      return { ...state, currentPoll: action.payload, loading: false }
    case 'ADD_POLL':
      return {
        ...state,
        polls: [action.payload, ...state.polls],
        loading: false
      }
    case 'UPDATE_POLL':
      return {
        ...state,
        polls: state.polls.map(p =>
          p._id === action.payload._id ? action.payload : p
        ),
        currentPoll:
          state.currentPoll?._id === action.payload._id
            ? action.payload
            : state.currentPoll,
        loading: false
      }
    case 'DELETE_POLL':
      return {
        ...state,
        polls: state.polls.filter(p => p._id !== action.payload),
        currentPoll:
          state.currentPoll?._id === action.payload ? null : state.currentPoll,
        loading: false
      }
    case 'SET_SOCKET':
      return { ...state, socket: action.payload }
    case 'UPDATE_POLL_REALTIME':
      return {
        ...state,
        polls: state.polls.map(p =>
          p._id === action.payload._id ? action.payload : p
        ),
        currentPoll:
          state.currentPoll?._id === action.payload._id
            ? action.payload
            : state.currentPoll
      }
    default:
      return state
  }
}

export const PollProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pollReducer, initialState)

  // Initialize socket connection once on mount
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000')
    dispatch({ type: 'SET_SOCKET', payload: socket })

    // Listen for real-time poll updates
    socket.on('poll-updated', data => {
      dispatch({ type: 'UPDATE_POLL_REALTIME', payload: data.poll })
    })

    // Clean up on unmount
    return () => {
      socket.disconnect()
    }
  }, []) // empty deps: run once

  // Memoized functions to prevent recreation on every render
  const fetchPolls = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await axios.get('/api/polls', { params })
      dispatch({ type: 'SET_POLLS', payload: response.data.polls })
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to fetch polls (fetchPolls)'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      throw error // Re-throw to allow caller to handle
    }
  }, [])

  const fetchPoll = useCallback(
    async id => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await axios.get(`/api/polls/${id}`)
        // If the API wraps the poll in an object, extract it:
        const poll = response.data.poll || response.data
        dispatch({ type: 'SET_CURRENT_POLL', payload: poll })

        // Join poll room for real-time updates
        if (state.socket) {
          state.socket.emit('join-poll', poll._id)
        }

        return poll
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to fetch poll (fetchPoll)'
        dispatch({ type: 'SET_ERROR', payload: message })
        toast.error(message)
        throw error
      }
    },
    [state.socket]
  )

  const fetchPollByShareCode = useCallback(
    async code => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await axios.get(`/api/polls/share/${code}`)
        // Extract the poll object from the response data
        const poll = response.data.poll || response.data
        dispatch({ type: 'SET_CURRENT_POLL', payload: poll })

        // Join poll room for real-time updates
        if (state.socket) {
          state.socket.emit('join-poll', poll._id)
        }

        return poll
      } catch (error) {
        const message =
          error.response?.data?.message ||
          'Failed to fetch poll (fetchPollByShareCode)'
        dispatch({ type: 'SET_ERROR', payload: message })
        toast.error(message)
        throw error
      }
    },
    [state.socket]
  )

  const createPoll = useCallback(async pollData => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await axios.post('/api/polls', pollData)
      const newPoll = response.data.poll
      dispatch({ type: 'ADD_POLL', payload: newPoll })
      toast.success('Poll created successfully!')
      return newPoll
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to create poll (createPoll)'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      throw error
    }
  }, [])

  const updatePoll = useCallback(async (id, updates) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await axios.put(`/api/polls/${id}`, updates)
      const updated = response.data.poll
      dispatch({ type: 'UPDATE_POLL', payload: updated })
      toast.success('Poll updated successfully!')
      return updated
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update poll (updatePoll)'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      throw error
    }
  }, [])

  const deletePoll = useCallback(async id => {
    try {
      await axios.delete(`/api/polls/${id}`)
      dispatch({ type: 'DELETE_POLL', payload: id })
      toast.success('Poll deleted successfully!')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete poll'
      toast.error(message)
      throw error
    }
  }, [])

  const vote = useCallback(async (pollId, optionIndex, action = 'vote') => {
    try {
      const response = await axios.post(`/api/votes/${pollId}`, {
        optionIndex,
        action
      })
      const updated = response.data.poll
      dispatch({ type: 'UPDATE_POLL', payload: updated })
      const message = action === 'vote' ? 'Vote recorded!' : 'Vote removed!'
      toast.success(message)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to vote'
      toast.error(message)
      throw error
    }
  }, [])

  const fetchUserPolls = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await axios.get('/api/polls/user/me', { params })
      dispatch({ type: 'SET_POLLS', payload: response.data.polls })
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to fetch user polls'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      throw error
    }
  }, [])

  const fetchVotingHistory = useCallback(async (params = {}) => {
    try {
      const response = await axios.get('/api/votes/user/history', { params })
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to fetch voting history'
      toast.error(message)
      throw error
    }
  }, [])

  const fetchPollAnalytics = useCallback(async pollId => {
    try {
      const response = await axios.get(`/api/votes/${pollId}/analytics`)
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to fetch analytics'
      toast.error(message)
      throw error
    }
  }, [])

  const leavePoll = useCallback(
    pollId => {
      if (state.socket) {
        state.socket.emit('leave-poll', pollId)
      }
    },
    [state.socket]
  )

  const value = {
    polls: state.polls,
    currentPoll: state.currentPoll,
    loading: state.loading,
    error: state.error,
    socket: state.socket,
    fetchPolls,
    fetchPoll,
    fetchPollByShareCode,
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    fetchUserPolls,
    fetchVotingHistory,
    fetchPollAnalytics,
    leavePoll
  }

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>
}

export const usePoll = () => {
  const context = useContext(PollContext)
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider')
  }
  return context
}
