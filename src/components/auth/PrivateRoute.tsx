import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0Context } from '../../contexts/Auth0Context';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth0Context();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirection after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !currentUser?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;