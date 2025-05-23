import { ReactNode, useEffect, useState } from 'react'; // Add useState
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0Context } from '../../contexts/Auth0Context';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutButton from '../ui/LogoutButton';
import Button from '../ui/Button';
import AiPromptsModal from '../modals/AiPromptsModal';
import ScannerGallerySideWindow from './ScannerGallerySideWindow'; // Import the new side window

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout } = useAuth0Context();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAiPromptsModalOpen, setIsAiPromptsModalOpen] = useState(false);
  const [isScannerGalleryOpen, setIsScannerGalleryOpen] = useState(false); // State for side window

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
      <div className="min-h-screen bg-gray-900 transition-colors duration-200 futuristic-grid-bg" style={{ backgroundColor: '#0f172a' }}>
        {/* Header */}
        <header className="futuristic-container has-scanline p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold holographic-text holographic-text-glitch"
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
                    <Button
                      onClick={() => setIsScannerGalleryOpen(true)}
                      variant="outline" 
                      size="sm"
                      className="text-cyan-300 border-cyan-400 hover:bg-cyan-700/50" // Consistent styling
                    >
                      Scanner Gallery
                    </Button>
                    <Button
                      onClick={() => setIsAiPromptsModalOpen(true)} // This is the existing AI Prompts button
                      variant="outline" 
                      size="sm"
                      className="text-cyan-300 border-cyan-400 hover:bg-cyan-700/50"
                    >
                      AI Prompts
                    </Button>

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
        <footer className="futuristic-container has-scanline p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} COMET Scanner Wizard
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </div>
          </div>
        </footer>

        {/* AI Prompts Modal */}
        <AnimatePresence>
          {isAiPromptsModalOpen && (
            <AiPromptsModal 
              isOpen={isAiPromptsModalOpen} 
              onClose={() => setIsAiPromptsModalOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Scanner Gallery Side Window */}
        <ScannerGallerySideWindow
          isOpen={isScannerGalleryOpen}
          onClose={() => setIsScannerGalleryOpen(false)}
        />

      </div> {/* This is the end of div className="min-h-screen bg-gray-900 ..." */}
    </div> /* This is the end of the outermost div */
  );
};

export default Layout;