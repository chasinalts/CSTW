// Login page component using Auth0 authentication
import { useEffect } from '../utils/react-imports';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth0Context } from '../contexts/Auth0Context';
import HolographicText from '../components/ui/HolographicText';

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Login = () => {
  const { login, currentUser, isLoading, isAuthenticated } = useAuth0Context();
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

  const handleLogin = async () => {
    try {
      login();
      // Auth0 will handle the redirect and callback
    } catch (error) {
      console.error('Login error:', error);
    }
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
            text="COMET Scanner Wizard"
            as="h2"
            variant="title"
            className="text-center font-extrabold"
          />
          <div className="mt-2">
            <HolographicText
              text="Signing you in..."
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
                Enter your credentials to sign in
              </p>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white futuristic-button"
              >
                {isLoading ? 'Signing in...' : 'Sign In with Auth0'}
              </button>
              <p className="mt-2 text-xs text-gray-400">
                You will be redirected to Auth0 for secure authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
