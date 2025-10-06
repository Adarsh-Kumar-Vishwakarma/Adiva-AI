import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen neural-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center ai-glow shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #60a5fa)'
               }}>
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will be handled by the parent component
  }

  return <>{children}</>;
};

export default ProtectedRoute;
