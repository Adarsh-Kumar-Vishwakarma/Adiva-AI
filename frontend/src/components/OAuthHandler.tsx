import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const OAuthHandler: React.FC = () => {
  const { loginWithToken } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if this is an OAuth callback by looking at the URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const success = urlParams.get('success');
      const error = urlParams.get('error');

      // Also check if the path contains /auth/callback
      const isCallbackPath = window.location.pathname.includes('/auth/callback') || 
                           window.location.pathname.includes('/callback');

      if (isCallbackPath || token || success || error) {

        if (success === 'true' && token) {
          try {
            // Login with the token from Google OAuth
            await loginWithToken(token);
            setIsSuccess(true);
            
            // Redirect to main app after successful login
            setTimeout(() => {
              // Clear the URL parameters and redirect to root
              window.history.replaceState({}, document.title, '/');
              window.location.reload();
            }, 2000);
          } catch (error) {
            console.error('Google OAuth login error:', error);
            setHasError(true);
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          }
        } else if (error) {
          console.error('Google OAuth error:', error);
          setHasError(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          // No valid parameters, redirect to main app
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      }
    };

    handleOAuthCallback();
  }, [loginWithToken]);

  // Check if this is an OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const success = urlParams.get('success');
  const error = urlParams.get('error');
  const isCallbackPath = window.location.pathname.includes('/auth/callback') || 
                        window.location.pathname.includes('/callback');

  // If this is an OAuth callback, show the callback UI
  if (isCallbackPath || token || success || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="glass-dark border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            {isSuccess ? (
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            ) : hasError ? (
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            ) : (
              <Loader2 className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            {isSuccess ? 'Login Successful!' : hasError ? 'Login Failed' : 'Processing...'}
          </h2>

          <p className="text-gray-300 mb-6">
            {isSuccess 
              ? 'You have been successfully logged in with Google. Redirecting to dashboard...'
              : hasError
              ? 'There was an error with Google login. Redirecting to main page...'
              : 'Please wait while we process your Google login...'
            }
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show nothing (let the main app render)
  return null;
};

export default OAuthHandler;
