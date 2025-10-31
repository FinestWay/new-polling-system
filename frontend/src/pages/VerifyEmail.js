import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.get('/api/auth/verify-email', {
          params: { token }
        });
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed.');
      }
    };

    verify();
  }, [searchParams]);

  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isLoading ? 'Verifying...' : isSuccess ? 'Email Verified' : 'Verification Failed'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              to={isSuccess ? '/login' : '/register'}
              className="w-full inline-flex justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {isSuccess ? 'Sign in' : 'Create account'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
