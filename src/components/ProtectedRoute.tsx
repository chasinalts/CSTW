import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0Context } from '../contexts/Auth0Context';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireOwner = false, requireAdmin = false }: ProtectedRouteProps) => {
  const { currentUser, isLoading, isAuthenticated } = useAuth0Context();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent getting stuck in checking auth state
    const authCheckTimeout = setTimeout(() => {
      console.log('ProtectedRoute: Auth check timed out after 5 seconds, forcing completion');
      setIsCheckingAuth(false);
    }, 5000);

    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Checking authentication');
        console.log('Current user:', currentUser);
        console.log('Is authenticated:', isAuthenticated);

        // If we're still loading auth state, wait
        if (isLoading) {
          console.log('ProtectedRoute: Auth is still loading');
          return;
        }

        // Not authenticated or no user profile, no access
        if (!isAuthenticated || !currentUser) {
          console.log('ProtectedRoute: Not authenticated or no user profile, no access');
          setHasAccess(false);
          setIsCheckingAuth(false);
          return;
        }

        // We have a user, check if they meet the owner requirement
        if (requireOwner && !currentUser.is_owner) {
          console.log('ProtectedRoute: Owner required but user is not owner');
          setHasAccess(false);
          setIsCheckingAuth(false);
          return;
        }

        // Check if they meet the admin requirement
        if (requireAdmin && !currentUser.is_owner && currentUser.role !== 'admin') {
          console.log('ProtectedRoute: Admin required but user is not admin or owner');
          setHasAccess(false);
          setIsCheckingAuth(false);
          return;
        }

        // User has access
        console.log('ProtectedRoute: User has access');
        setHasAccess(true);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('ProtectedRoute: Error checking auth', error);
        setHasAccess(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Clean up the timeout on unmount or when dependencies change
    return () => {
      clearTimeout(authCheckTimeout);
    };
  }, [currentUser, isLoading, isAuthenticated, requireOwner, requireAdmin]);

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-300">Verifying access...</span>
        </div>
      </div>
    );
  }

  // No access, redirect appropriately
  if (!hasAccess) {
    if (!currentUser) {
      // No user, redirect to login
      console.log('ProtectedRoute: Redirecting to login');
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Check if this is a dashboard route and user is not owner/admin
    if (location.pathname === '/dashboard' &&
        !currentUser.is_owner && currentUser.role !== 'admin') {
      // User is not an owner or admin, redirect to home
      console.log('ProtectedRoute: Redirecting to home (not owner/admin)');
      return (
        <Navigate
          to="/home"
          state={{ error: 'Owner or admin access required for dashboard' }}
          replace
        />
      );
    }

    if (requireOwner && !currentUser.is_owner) {
      // User is not an owner, redirect to home
      console.log('ProtectedRoute: Redirecting to home (not owner)');
      return (
        <Navigate
          to="/home"
          state={{ error: 'Owner access required' }}
          replace
        />
      );
    }

    if (requireAdmin && !currentUser.is_owner && currentUser.role !== 'admin') {
      // User is not an admin or owner, redirect to home
      console.log('ProtectedRoute: Redirecting to home (not admin)');
      return (
        <Navigate
          to="/home"
          state={{ error: 'Admin access required' }}
          replace
        />
      );
    }

    // Generic access denied, redirect to login
    console.log('ProtectedRoute: Redirecting to login (generic access denied)');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User has access, render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;