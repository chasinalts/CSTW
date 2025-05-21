import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import Layout from './layout/Layout';
const Login = React.lazy(() => import('../pages/Login'));
import SuspenseFallback from './ui/SuspenseFallback';

const RoleBasedLoginRedirect = () => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <SuspenseFallback message="Checking authentication..." />;
  if (currentUser) {
    if (currentUser.is_owner || currentUser.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  // Not logged in: show login page
  return (
    <Layout>
      <Suspense fallback={<SuspenseFallback message="Loading login page..." />}>
        <Login />
      </Suspense>
    </Layout>
  );
};

export default RoleBasedLoginRedirect;
