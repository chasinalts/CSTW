import React from 'react';
import { useCallback, useState, useRef, type DragEvent } from '../../utils/react-imports';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'compact';
  isLoading?: boolean;
}

interface FileError {
  type: 'size' | 'type';
  message: string;
}

const LoadingSpinner: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative w-8 h-8"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-2 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"
    />
  </motion.div>
);

const UploadIcon: React.FC = () => (
  <svg
    className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const DragIcon: React.FC = () => (
  <motion.svg
    initial={{ scale: 1 }}
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m0-16l-4 4m4-4l4 4"
    />
  </motion.svg>
);

const ErrorIcon: React.FC = () => (
  <motion.svg
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="w-8 h-8 text-red-500 mb-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </motion.svg>
);

export default function DragDropUpload({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5,
  title = 'Upload File',
  description = 'Drag and drop a file here, or click to select',
  variant = 'default',
  isLoading = false
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<FileError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): FileError | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return {
        type: 'size',
        message: `File size exceeds ${maxSize}MB limit`
      };
    }

    if (!accept.includes('*') && !accept.includes(file.type)) {
      return {
        type: 'type',
        message: 'Invalid file type'
      };
    }

    return null;
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (isLoading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        setError(fileError);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize, accept, isLoading]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoading) {
      setIsDragging(true);
      setError(null);
    }
  }, [isLoading]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!isLoading) {
      setError(null);
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;

    const file = e.target.files?.[0];
    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        setError(fileError);
        return;
      }
      onFileSelect(file);
    }
    // Reset the input value to allow uploading the same file again
    e.target.value = '';
  };

  const isCompact = variant === 'compact';

  return (
    <motion.div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        borderColor: isDragging ? '#3B82F6' : error ? '#EF4444' : undefined,
        scale: isDragging ? 1.02 : 1
      }}
      transition={{ duration: 0.2 }}
      className={`
        relative cursor-pointer
        ${isCompact ? 'p-3' : 'p-6'}
        rounded-lg border-2 border-dashed
        ${isLoading ? 'cursor-wait ' : ''}
        ${error
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
        transition-colors duration-200
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
      />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
          >
            <LoadingSpinner />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blue-500 dark:text-blue-400 font-medium mt-2"
            >
              Uploading...
            </motion.div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/50 dark:bg-red-900/30 rounded-lg backdrop-blur-sm"
          >
            <ErrorIcon />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 dark:text-red-400 font-medium text-center"
            >
              {error.message}
              <p className="text-sm mt-1 text-red-400 dark:text-red-300">
                Click or drag a new file to try again
              </p>
            </motion.div>
          </motion.div>
        ) : isDragging ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/30 rounded-lg backdrop-blur-sm"
          >
            <DragIcon />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blue-500 dark:text-blue-400 font-medium"
            >
              Drop to upload
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center ${isCompact ? 'space-y-1' : 'space-y-2'}`}
          >
            <div className="flex flex-col items-center">
              <UploadIcon />
              <div className={`${isCompact ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-white`}>
                {title}
              </div>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                {description}
              </p>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-400 dark:text-gray-500`}>
                Max size: {maxSize}MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}