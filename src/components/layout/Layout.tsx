import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutButton from '../ui/LogoutButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Logout is now handled by the LogoutButton component

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0f172a';

    return () => {
      // Cleanup not needed as we always want dark mode
    };
  }, []);

  return (
    <div className="min-h-screen dark">
      <div className="min-h-screen bg-gray-900 transition-colors duration-200" style={{ backgroundColor: '#0f172a' }}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  COMET Scanner Wizard
                </motion.h1>
              </div>

              <AnimatePresence mode="wait">
                {currentUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {currentUser.is_owner && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium mr-2">
                          Owner
                        </span>
                      )}
                      <span>{currentUser.email}</span>
                    </div>
                    <LogoutButton
                      variant="text"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {currentUser && (
              <nav className="flex space-x-8 -mb-px">
                {/* For owners and admins, show Dashboard as the first link */}
                {(currentUser.is_owner === true || currentUser.is_owner === 'true' || currentUser.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    className={`border-b-2 py-4 px-1 inline-flex items-center text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}

                {/* Home link for all users */}
                <Link
                  to="/home"
                  className={`border-b-2 py-4 px-1 inline-flex items-center text-sm font-medium transition-colors ${
                    isActive('/home')
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Home
                </Link>

                {/* Scanner Templates link for all users */}
                <Link
                  to="/scanner"
                  className={`border-b-2 py-4 px-1 inline-flex items-center text-sm font-medium transition-colors ${
                    isActive('/scanner')
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Scanner Templates
                </Link>
              </nav>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} COMET Scanner Wizard
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;