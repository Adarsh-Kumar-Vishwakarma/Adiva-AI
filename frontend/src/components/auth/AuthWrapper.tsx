import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProtectedRoute from './ProtectedRoute';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen neural-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center ai-glow shadow-lg animate-pulse"
               style={{
                 background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #60a5fa)'
               }}>
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthMode('register')}
            onLoginSuccess={() => {
              // Login success is handled by the AuthContext
              // The component will automatically re-render when isAuthenticated becomes true
            }}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode('login')}
            onRegisterSuccess={() => {
              // Registration success is handled by the AuthContext
              // The component will automatically re-render when isAuthenticated becomes true
            }}
          />
        )}
      </>
    );
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default AuthWrapper;
