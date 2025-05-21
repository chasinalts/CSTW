import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface SuspenseFallbackProps {
  message?: string;
}

const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{message}</p>
      </motion.div>
    </div>
  );
};

export default SuspenseFallback;
