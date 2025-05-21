// Signup page component using Auth0 authentication
import { useEffect, useState } from '../utils/react-imports';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth0Context } from '../contexts/Auth0Context';
import HolographicText from '../components/ui/HolographicText';

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Signup = () => {
  const [redirecting, setRedirecting] = useState(false);
  const { signup, currentUser, isLoading, isAuthenticated } = useAuth0Context();
  const navigate = useNavigate();

  // If user is already logged in, redirect to the appropriate page
  useEffect(() => {
    if (isAuthenticated && currentUser && !isLoading) {
      // Redirect owners and admins to the dashboard, others to home
      const isOwner = currentUser.is_owner === true || currentUser.is_owner === 'true';
      const isAdmin = currentUser.role === 'admin';

      if (isOwner || isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [currentUser, isLoading, isAuthenticated, navigate]);

  // Auto-redirect to signup after a short delay
  useEffect(() => {
    if (!isAuthenticated && !isLoading && !redirecting) {
      const redirectTimer = setTimeout(() => {
        setRedirecting(true);
        signup();
      }, 1500); // Redirect after 1.5 seconds

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, signup, redirecting]);

  const handleSignup = () => {
    setRedirecting(true);
    signup();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 futuristic-grid-bg"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <HolographicText
            text="Create your account"
            as="h2"
            variant="title"
            className="text-center font-extrabold"
          />
          <div className="mt-2">
            <HolographicText
              text="Setting up registration..."
              as="h3"
              variant="subtitle"
              className="text-center"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10 futuristic-container holo-glow">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-4">
                Enter your information to create an account.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                If you are not redirected automatically, click the button below.
              </p>
              <button
                type="button"
                onClick={handleSignup}
                disabled={redirecting}
                className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white futuristic-button"
              >
                Sign Up with Auth0
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Signup;
