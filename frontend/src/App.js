import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import MyPolls from './pages/MyPolls';
import Profile from './pages/Profile';
import VotingHistory from './pages/VotingHistory';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/poll/:id" element={<PollDetail />} />
          <Route path="/share/:code" element={<PollDetail />} />
          <Route 
            path="/create" 
            element={
              <PrivateRoute>
                <CreatePoll />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-polls" 
            element={
              <PrivateRoute>
                <MyPolls />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/voting-history" 
            element={
              <PrivateRoute>
                <VotingHistory />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;




