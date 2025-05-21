import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }[color];

  const spinner = (
    <div className="flex flex-col items-center space-y-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg
          className={`${sizeClasses} ${colorClasses}`}
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
      </motion.div>
      {text && (
        <span className={`text-sm font-medium ${colorClasses}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Loading overlay for blocking interactions during async operations
export const LoadingOverlay = ({ text }: { text?: string }) => (
  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1
        }}
        className="h-4 bg-gray-200 rounded"
        style={{
          width: `${Math.random() * 30 + 70}%`
        }}
      />
    ))}
  </div>
);

export default LoadingSpinner;