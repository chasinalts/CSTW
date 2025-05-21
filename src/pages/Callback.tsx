// Callback page for Auth0 authentication
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import SuspenseFallback from '../components/ui/SuspenseFallback';

const Callback = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // If authentication is complete, redirect to the appropriate page
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if the user is an owner or admin based on email
        // This is a temporary solution until we have proper role management
        const isOwnerOrAdmin = 
          user?.email === 'chasinalts@gmail.com' || 
          (user?.email && (user.email.includes('owner') || user.email.includes('admin')));

        // Redirect to dashboard for owners/admins, home for regular users
        if (isOwnerOrAdmin) {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        // If not authenticated, redirect to login
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center futuristic-grid-bg">
      <SuspenseFallback message="Completing authentication..." />
    </div>
  );
};

export default Callback;
